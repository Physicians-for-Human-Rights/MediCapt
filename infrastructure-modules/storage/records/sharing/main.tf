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

variable "cognito_identity_provider_aud" {
  description = "The identity pool id for providers"
  type        = string
}

variable "cognito_identity_associate_aud" {
  description = "The identity pool id for associates"
  type        = string
}

variable "dynamodb_point_in_time_recovery" {
  description = "Should we enable point in time recovery for this table"
  type        = bool
}

module "dynamodb_table" {
  source = "cloudposse/dynamodb/aws" 
  version     = "0.29.4"
  name                         = "${var.namespace}-${var.stage}-record-sharing"
  enable_encryption	       = true
  enable_streams	       = false
  ttl_enabled	               = false
  # Once Medicapt scales sufficiently, it will be cheaper to configure autoscaling
  enable_autoscaler            = false
  billing_mode                 = "PAY_PER_REQUEST"
  autoscale_min_read_capacity  = null
  autoscale_min_write_capacity = null
  enable_point_in_time_recovery = var.dynamodb_point_in_time_recovery
  #
  hash_key                     = "sharedWithUUID"
  hash_key_type	               = "S"
  range_key                    = "shareUUID"
  range_key_type               = "S"
  dynamodb_attributes = [
    #
    # Terraform only wants the fields which serve as indexes.
    #
    {
      name = "sharedOnDate"
      type = "S"
    },
    {
      name = "sharedByUUID"
      type = "S"
    }
  ]
  global_secondary_index_map = [
    {
      name               = "RecordsSharedByDate"
      hash_key           = "sharedWithUUID"
      range_key          = "sharedOnDate"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "RecordsByOriginAndDate"
      hash_key           = "sharedByUUID"
      range_key          = "sharedOnDate"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    }
  ]
}

resource "aws_iam_policy" "associate_policy" {
  name        = "${var.namespace}-${var.stage}-associate-record-sharing"
  description = "Access to the record sharing dynamodb for associates"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": ["${module.dynamodb_table.table_arn}"],
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "${var.cognito_identity_associate_aud}"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        },
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["$${cognito-identity.amazonaws.com:sub}"]
        }
      }
    }
  ]
}
EOF
}

resource "aws_iam_policy" "provider_policy" {
  name        = "${var.namespace}-${var.stage}-provider-record-sharing"
  description = "Access to the record sharing dynamodb for providers"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": ["${module.dynamodb_table.table_arn}"],
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "${var.cognito_identity_provider_aud}"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        },
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["$${cognito-identity.amazonaws.com:sub}"]
        }
      }
    }
  ]
}
EOF
}

###############################################################################

output "dynamodb" {
  value = module.dynamodb_table
}

output "associate_policy" {
  value = resource.aws_iam_policy.associate_policy
}

output "provider_policy" {
  value = resource.aws_iam_policy.provider_policy
}
