terraform {
  required_version = ">= 1.1, < 1.2"
}

variable "aws_region" {
  description = "The AWS region, e.g., us-east-1."
  type        = string
}

variable "stage" {
  description = "Development stage, e.g., prod."
  type        = string
}

variable "namespace" {
  description = "The namespace of the app, e.g., medicapt"
  type        = string
}

variable "domain_name" {
  description = "The domain name, e.g., medicapt.com"
  type        = string
}

variable "user_type" {
  description = "The type of user, e.g., provider or manager"
  type        = string
}

variable "cognito_default_users" {
  description = "A map of usernames to emails to add by default, e.g., {\"a\"=\"a@a.com\"}"
  type        = map
}

variable "temporary_password_validity_days" {
  description = "Days while temporary password is valid"
  type        = number
}

variable "invite_email_subject" {
  description = "Subject line of the invite email"
  type        = string
}
variable "invite_email_message" {
  description = "Body of the invite email"
  type        = string
}
variable "invite_sms_message" {
  description = "Body of the invite sms"
  type        = string
}

variable "mfa_configuration" {
  description = "Multi-factor authentication type"
  type        = string
}

variable "user_attributes" {
  description = "User attribute schema"
  type        = list(map(any))
}

variable "advanced_security_mode" {
  description = "The advanced security mode, should be either AUDIT or ENFORCED. Never OFF"
  type        = string
}

module "cognito_user_pool" {
  source  = "mineiros-io/cognito-user-pool/aws"
  version = "~> 0.9.1"

  name = "${var.namespace}-${var.user_type}-${var.stage}"

  allow_admin_create_user_only = true

  enable_username_case_sensitivity = false
  advanced_security_mode           = var.advanced_security_mode

  auto_verified_attributes = [
    "email"
  ]

  account_recovery_mechanisms = [
    {
      name     = "verified_email"
      priority = 1
    },
    {
      name     = "verified_phone_number"
      priority = 2
    }
  ]

  invite_email_subject = var.invite_email_subject
  invite_email_message = var.invite_email_message
  invite_sms_message   = var.invite_sms_message

  domain                = "${var.namespace}-draft-${var.user_type}-${var.stage}"
  default_email_option  = "CONFIRM_WITH_LINK"
  email_subject         = "MediCapt Verification Code"
  email_subject_by_link = "MediCapt Verification Link"
  email_message_by_link = "Please click the link below to verify your email address. {##Verify Email##}."
  sms_message           = "Your MediCapt verification code is {####}"

  challenge_required_on_new_device = true
  user_device_tracking             = "ALWAYS"

  # TODO These paramters can be used to configure SES for emails
  # email_sending_account  = "DEVELOPER"
  # email_reply_to_address = "support@mineiros.io"
  # email_from_address     = "noreply@mineiros.io"
  # email_source_arn       = "arn:aws:ses:us-east-1:999999999999:identity"

  mfa_configuration        = var.mfa_configuration
  allow_software_mfa_token = true

  password_minimum_length    = 10
  password_require_lowercase = true
  password_require_numbers   = true
  password_require_uppercase = true
  password_require_symbols   = true

  temporary_password_validity_days = var.temporary_password_validity_days

  schema_attributes = var.user_attributes

  clients = [
    {
      name                 = "web"
    },
    {
      name                 = "native"
      generate_secret      = true
    }
  ]

  tags = {
    environment = "${var.stage}"
  }
}

resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = module.cognito_user_pool.user_pool.id
  description  = "Admins have permissions to all locations"
}

resource null_resource cognito_users {
  for_each = var.cognito_default_users
  triggers = {
    aws_region = var.aws_region
    user_pool  = module.cognito_user_pool.user_pool.id
  }
  provisioner local-exec {
    command = "aws --region ${var.aws_region} cognito-idp admin-create-user --user-pool-id ${self.triggers.user_pool} --username ${each.key} --user-attributes Name=email,Value=${each.value}"
  }
  provisioner local-exec {
    when    = destroy
    command = "aws --region ${self.triggers.aws_region} cognito-idp admin-delete-user --user-pool-id ${self.triggers.user_pool} --username ${each.key}"
  }
}

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${var.namespace}-${var.user_type}-${var.stage}"
  allow_unauthenticated_identities = false
  allow_classic_flow               = false
  cognito_identity_providers {
    client_id               = module.cognito_user_pool.clients.web.id
    provider_name           = module.cognito_user_pool.user_pool.endpoint
  }
  cognito_identity_providers {
    client_id               = module.cognito_user_pool.clients.native.id
    provider_name           = module.cognito_user_pool.user_pool.endpoint
  }
}

resource "aws_iam_role" "authenticated" {
  name = "${var.namespace}-${var.user_type}-${var.stage}-cognito-authenticated"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": ["sts:AssumeRoleWithWebIdentity", "sts:TagSession"],
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "${aws_cognito_identity_pool.main.id}"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
EOF
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id
  roles = {
    "authenticated" = aws_iam_role.authenticated.arn
  }
}


module "s3_bucket" {
  source                       = "cloudposse/s3-bucket/aws"
  version                      = "0.46.0"
  acl                          = "private"
  enabled                      = true
  user_enabled                 = false
  versioning_enabled           = true
  sse_algorithm                = "aws:kms"
  allow_encrypted_uploads_only = true
  #
  allowed_bucket_actions       = [
    "s3:GetObject",
    "s3:PutObject",
    "s3:PutObjectTagging"
  ]
  name                         = "${var.stage}-${var.namespace}-cognito-image-${var.user_type}"
  cors_rule_inputs = [{
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }]
}

###############################################################################

output "cognito_user_pool_id" {
  value = module.cognito_user_pool.user_pool.id
}

output "cognito_user_pool_clients" {
  value = module.cognito_user_pool.clients
}

output "cognito_user_pool_client_web" {
  value = module.cognito_user_pool.clients.web
}

output "cognito_user_pool_client_native" {
  value = module.cognito_user_pool.clients.native
}

output "cognito_user_pool_domain" {
  value = module.cognito_user_pool.domain
}

output "cognito_user_pool_arn" {
  value = module.cognito_user_pool.user_pool.arn
}

output "cognito_identity_pool" {
  value = aws_cognito_identity_pool.main
}

output "image_bucket_arn" {
  value = module.s3_bucket.bucket_arn
}

output "image_bucket_id" {
  value = module.s3_bucket.bucket_id
}

output "cognito_admin_group" {
  value = aws_cognito_user_group.admin
}
