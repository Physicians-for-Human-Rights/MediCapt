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

variable "dynamodb_point_in_time_recovery" {
  description = "Should we enable point in time recovery for this table"
  type        = bool
}

variable "records_dynamodb_kms_deletion_window_in_days" {
  description = "Days of protection you want for your KMS for Dynamo"
  type        = number
}

variable "cognito_identity_pool" {
  description = "The cognito identity pool for providers"
  type        = any
}

module "kms_key" {
  source                   = "cloudposse/kms-key/aws"
  version                  = "0.12.1"
  name                     = "${var.stage}-${var.namespace}-records-dynamodb"
  description              = "Key for the records dynamodb"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  deletion_window_in_days  = var.records_dynamodb_kms_deletion_window_in_days
  enable_key_rotation      = true
  key_usage                = "ENCRYPT_DECRYPT"
  alias                    = "alias/records_dynamodb_key"
}

module "dynamodb_table" {
  source = "cloudposse/dynamodb/aws" 
  version     = "0.29.4"
  name                               = "${var.namespace}-${var.stage}-record-metadata"
  enable_encryption                  = true
  server_side_encryption_kms_key_arn = module.kms_key.key_arn
  enable_streams                     = false
  ttl_enabled                        = false
  # Once Medicapt scales sufficiently, it will be cheaper to configure autoscaling
  enable_autoscaler                  = false
  billing_mode                       = "PAY_PER_REQUEST"
  autoscale_min_read_capacity        = null
  autoscale_min_write_capacity       = null
  enable_point_in_time_recovery      = var.dynamodb_point_in_time_recovery
  #
  hash_key                     = "PK"
  hash_key_type	               = "S"
  range_key                    = "SK"
  range_key_type               = "S"
  dynamodb_attributes = [
    {
      name = "GPK1"
      type = "S"
    },
    {
      name = "GSK1"
      type = "S"
    },
    {
      name = "GPK2"
      type = "S"
    },
    {
      name = "GSK2"
      type = "S"
    },
    {
      name = "GPK2"
      type = "S"
    },
    {
      name = "GPK3"
      type = "S"
    },
    {
      name = "GSK3"
      type = "S"
    },
    {
      name = "GPK4"
      type = "S"
    },
    {
      name = "GSK4"
      type = "S"
    },
    {
      name = "GPK5"
      type = "S"
    },
    {
      name = "GSK5"
      type = "S"
    }
  ]
  global_secondary_index_map = [
    {
      name               = "RecordID"
      hash_key           = "GPK1"
      range_key          = "GSK1"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "Latest"
      hash_key           = "GPK2"
      range_key          = "GSK2"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "LatestByLocation"
      hash_key           = "GPK3"
      range_key          = "GSK3"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "LatestByCreator"
      hash_key           = "GPK4"
      range_key          = "GSK4"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "LatestByUpdatedBy"
      hash_key           = "GPK5"
      range_key          = "GSK5"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    }
  ]
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
          "cognito-identity.amazonaws.com:aud": "${var.cognito_identity_pool.id}"
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

output "records_dynamodb" {
  value = module.dynamodb_table
}

output "records_dynamodb_kms" {
  value = module.kms_key
}
