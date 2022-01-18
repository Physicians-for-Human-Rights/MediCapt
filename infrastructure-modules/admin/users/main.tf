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

module "cognito_user_pool" {
  source  = "mineiros-io/cognito-user-pool/aws"
  version = "~> 0.9.1"

  name = "${var.namespace}-${var.user_type}-${var.stage}"

  # TODO
  # We allow the public to create user profiles
  allow_admin_create_user_only = false

  enable_username_case_sensitivity = false
  advanced_security_mode           = "ENFORCED"

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

  invite_email_subject = "Invitation to MediCapt as a healthcare provider"
  invite_email_message = <<EOF
Welcome to MediCapt!

Your username is {username} and your temporary password is {####}

Thank you!
Medicapt team
EOF
  invite_sms_message   = <<EOF
Welcome to MediCapt!

Your username is {username} and your temporary password is {####}

Thank you!
Medicapt team
EOF

  domain                = "${var.namespace}-${var.stage}"
  default_email_option  = "CONFIRM_WITH_LINK"
  email_subject         = "MediCapt Verification Code"
  email_subject_by_link = "MediCapt Verification Link"
  email_message_by_link = "Please click the link below to verify your email address. {##Verify Email##}."
  sms_message           = "Your MediCapt verification code is {####}"

  challenge_required_on_new_device = true
  user_device_tracking             = "ALWAYS"

  # These paramters can be used to configure SES for emails
  # email_sending_account  = "DEVELOPER"
  # email_reply_to_address = "support@mineiros.io"
  # email_from_address     = "noreply@mineiros.io"
  # email_source_arn       = "arn:aws:ses:us-east-1:999999999999:identity"

  # Require MFA
  mfa_configuration        = "ON"
  allow_software_mfa_token = true

  password_minimum_length    = 10
  password_require_lowercase = true
  password_require_numbers   = true
  password_require_uppercase = true
  password_require_symbols   = true

  temporary_password_validity_days = var.temporary_password_validity_days

  schema_attributes = [
    {
      type     = "String"
      name     = "email"
      required = true
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "birthdate"
      required = true
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "name"
      required = true
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "nickname"
      required = true
      mutable  = true
      min_length = 1
      max_length = 300
    },
    {
      type     = "String"
      name     = "gender"
      required = true
      mutable  = true
      min_length = 1
      max_length = 300
    },
    # Custom attributes cannot be required
    {
      type     = "String"
      name     = "official_id_type"
      required = false
      mutable  = true
      min_length = 3
      max_length = 300
    },
    # Custom attributes cannot be required
    {
      type     = "String"
      name     = "official_id_code"
      required = false
      mutable  = true
      min_length = 3
      max_length = 300
    },
    # Custom attributes cannot be required
    {
      type     = "String"
      name     = "official_id_expires"
      required = false
      mutable  = true
      min_length = 3
      max_length = 300
    }
  ]

  clients = [
    {
      name                 = "web"
      read_attributes      = ["email", "email_verified", "preferred_username"]
      allowed_oauth_scopes = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
      allowed_oauth_flows  = ["code", "implicit"]
      callback_urls        = ["https://${var.stage}.${var.domain_name}/signedin", "https://${var.stage}.${var.domain_name}/redirect"]
      logout_urls          = ["https://${var.stage}.${var.domain_name}/signedout"]
      default_redirect_uri = "https://${var.stage}.${var.domain_name}/redirect"
      generate_secret      = false
      supported_identity_providers = [ "COGNITO" ]
    }
  ]

  tags = {
    environment = "${var.stage}"
  }
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

###############################################################################

output "cognito_user_pool_id" {
  value = module.cognito_user_pool.user_pool.id
}

output "cognito_user_pool_clients" {
  value = module.cognito_user_pool.clients
}

output "cognito_user_pool_domain" {
  value = module.cognito_user_pool.domain
}
