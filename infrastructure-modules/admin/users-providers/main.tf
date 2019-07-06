terraform {
  required_version = ">= 0.12, < 0.13"
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region
  version = "~> 2.0"
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

variable "user_reply_to_email" {
  description = "The email that Cognito will tell users to reply to"
  type        = string
}

variable "kms_key_id" {
  description = "The ID of the KMS CMK key to monitor."
  type        = string
}

variable "domain_name" {
  description = "Site domain name"
  type        = string
}

variable "cognito_sms_external_id" {
  description = "Used for SMS verification"
  type        = string
}

data "aws_acm_certificate" "main" {
  domain   = "${var.domain_name}"
  statuses = ["ISSUED"]
}

resource "aws_iam_role" "cognito_sns_role" {
  name = "${var.namespace}-${var.stage}-providers-cognito-sns-role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "cognito-idp.amazonaws.com"
      },
      "Condition": {
        "StringEquals": {"sts:ExternalId": "${var.cognito_sms_external_id}"}
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "cognito_sns_role" {
  name        = "${var.namespace}-${var.stage}-providers-cognito-sns-policy"
  description = "${var.namespace} Cognito allow SNS publish"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "sns:Publish*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_policy_attachment" "cognito_sns_role" {
  name       = "${var.namespace}-providers-cognito-sns-role-policy"
  roles      = ["${aws_iam_role.cognito_sns_role.name}"]
  policy_arn = "${aws_iam_policy.cognito_sns_role.arn}"
}

resource "aws_cognito_user_pool" "main" {
  name = "${var.namespace}-${var.stage}-providers"
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_message        = <<EOF
Welcome to MediCapt.

We need to verify your email.
Your verification code is: {####}

Thank you!"
Medicapt team
EOF
    email_message_by_link = <<EOF
Welcome to MediCapt.

We need to verify your email.
Click the verification link: {##Click Here##}

Thank you!"
Medicapt team
EOF
    email_subject         = "MediCapt Verification Code"
    email_subject_by_link = "MediCapt Verification Link"
    sms_message           = "Your MediCapt verification code is {####}"
  }

  auto_verified_attributes = ["email"]

  device_configuration {
    challenge_required_on_new_device = true
    device_only_remembered_on_user_prompt = true
  }

  email_configuration {
    reply_to_email_address = var.user_reply_to_email
    # TODO We should switch to sending email with SES
    # email_sending_account =
    # source_arn = 
  }

  # TODO We need to set this up with a pre-hook so that only approved users can register.
  # lambda_config =
  # (Optional) - A container for the AWS Lambda triggers associated with the user pool.

  mfa_configuration = "ON"

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }

  sms_configuration {
    external_id    = var.cognito_sms_external_id
    sns_caller_arn = "${aws_iam_role.cognito_sns_role.arn}"
  }
  
  user_pool_add_ons {
    advanced_security_mode = "AUDIT"
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
    invite_message_template {
      sms_message   = "MediCapt Invitation. User: {username} Pass: {####} https://${var.domain_name}"
      email_subject = "MediCapt Invitation"
      email_message = <<EOF
You've received an invitation to MediCapt!
https://${var.domain_name}

Your username is {username}
With a temporary Password: {####}

When you log in for the first time, you will choose a permanent password.

Thank you!
Medicapt team
EOF
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 300
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "birthdate"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 300
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 300
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "nickname"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 300
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "gender"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 300
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "phone_number"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 300
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "government_id_type"
    # required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 300
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "government_id_number"
    # required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 300
    }
  }

  lambda_config {
    pre_sign_up = "${aws_lambda_function.pre_sign_up.arn}"
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name            = "${var.namespace}-${var.stage}-providers-client-web"
  user_pool_id    = "${aws_cognito_user_pool.main.id}"
  generate_secret = false # TODO The JS API does not support client secrets
  # https://github.com/aws-amplify/amplify-js/tree/master/packages/amazon-cognito-identity-js
  # When creating the App, the generate client secret box must be unchecked because the JavaScript SDK doesn't support apps that have a client secret.
  callback_urls   = ["https://www.${var.domain_name}/signedin"]
  logout_urls     = ["https://www.${var.domain_name}/signedout"]
  allowed_oauth_flows = ["code", "implicit"]
  allowed_oauth_scopes = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
  supported_identity_providers = [ "COGNITO" ]
}

resource "aws_cognito_user_pool_domain" "main" {
  domain          = "${var.namespace}-${var.stage}-providers-main"
  user_pool_id    = aws_cognito_user_pool.main.id
}

# TODO We can create our own custom domain for this
# NB This is very slow to create
#
# resource "aws_cognito_user_pool_domain" "main" {
#   domain          = "cognito.${var.domain_name}"
#   certificate_arn = data.aws_acm_certificate.main.arn
#   user_pool_id    = aws_cognito_user_pool.main.id
# }

###############################################################################

resource "aws_iam_role" "cognito" {
  name = "${var.namespace}-${var.stage}-providers-cognito"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Principal": {
      "Federated": "cognito-identity.amazonaws.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "cognito-identity.amazonaws.com:aud": "${aws_cognito_identity_pool.main.id}"
      },
      "ForAnyValue:StringLike": {
        "cognito-identity.amazonaws.com:amr": "authenticated"
      }
    }
  }
}
EOF
}

resource "aws_iam_role" "lambda" {
  name = "${var.namespace}-providers-identity-lambda"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Principal": {
      "Service": "lambda.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
  }
}
EOF
}

resource "aws_iam_policy" "lambda" {
  name = "${var.namespace}-identity-lambda"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:ListUsers"
      ],
      "Resource": "${aws_cognito_user_pool.main.arn}"
    }
  ]
}
EOF
}

resource "aws_iam_policy_attachment" "lambda" {
  name = "${var.namespace}-providers-identity-lambda"
  policy_arn = "${aws_iam_policy.lambda.arn}"
  roles      = ["${aws_iam_role.lambda.name}"]
}

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name      = "${var.namespace}_${var.stage}_providers"
  developer_provider_name = "${var.namespace}_${var.stage}_providers"
  allow_unauthenticated_identities = false
  cognito_identity_providers {
    client_id               = "${aws_cognito_user_pool_client.web.id}"
    # server_side_token_check = true
    provider_name = "cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = "${aws_cognito_identity_pool.main.id}"
  roles = {
    "authenticated" = "${aws_iam_role.cognito.arn}"
  }
}

###############################################################################

data "archive_file" "src" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/src.zip"
}

resource "aws_lambda_function" "pre_sign_up" {
  function_name = "${var.namespace}-${var.stage}-providers-pre-sign-up"
  role          = "${aws_iam_role.lambda.arn}"
  runtime       = "nodejs8.10"
  filename      = data.archive_file.src.output_path
  handler       = "index.handler"
  timeout       = 30
  memory_size   = 128
  source_code_hash = data.archive_file.src.output_base64sha256
}

resource "aws_lambda_permission" "pre_sign_up" {
  principal     = "cognito-idp.amazonaws.com"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pre_sign_up.arn
  source_arn    = aws_cognito_user_pool.main.arn
}

###############################################################################

output "cognito_user_pool_main" {
  value = aws_cognito_user_pool.main
}

output "cognito_user_pool_client_web" {
  value = aws_cognito_user_pool_client.web
}

output "cognito_identity_pool_main" {
  value = aws_cognito_identity_pool.main
}
