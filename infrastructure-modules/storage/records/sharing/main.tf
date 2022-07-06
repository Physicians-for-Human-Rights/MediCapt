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

variable "records_dynamodb_kms_deletion_window_in_days" {
  description = "Days of protection you want for your KMS for Dynamo"
  type        = number
}

module "kms_key" {
  source                   = "cloudposse/kms-key/aws"
  version                  = "0.12.1"
  name                     = "${var.stage}-${var.namespace}-sharing-dynamodb"
  description              = "Key for the sharing dynamodb"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  deletion_window_in_days  = var.records_dynamodb_kms_deletion_window_in_days
  enable_key_rotation      = true
  key_usage                = "ENCRYPT_DECRYPT"
  alias                    = "alias/sharing_dynamodb_key"
}

module "dynamodb_table" {
  source = "cloudposse/dynamodb/aws"
  version     = "0.29.4"
  name                         = "${var.namespace}-${var.stage}-record-sharing"
  enable_encryption	       = true
  server_side_encryption_kms_key_arn = module.kms_key.key_arn
  enable_streams	       = false
  #
  ttl_enabled	               = true
  ttl_attribute	               = "TTL"
  # Once Medicapt scales sufficiently, it will be cheaper to configure autoscaling
  enable_autoscaler            = false
  billing_mode                 = "PAY_PER_REQUEST"
  autoscale_min_read_capacity  = null
  autoscale_min_write_capacity = null
  enable_point_in_time_recovery = var.dynamodb_point_in_time_recovery
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
    }
  ]
  global_secondary_index_map = [
    {
      name               = "SharedByDate"
      hash_key           = "GPK1"
      range_key          = "GSK1"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "SharedWithID"
      hash_key           = "GPK2"
      range_key          = "GSK2"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "SharedWithDate"
      hash_key           = "GPK3"
      range_key          = "GSK3"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "ByRecord"
      hash_key           = "GPK4"
      range_key          = "GSK4"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    }
  ]
}

###############################################################################

output "sharing_dynamodb" {
  value = module.dynamodb_table
}

output "sharing_dynamodb_kms" {
  value = module.kms_key
}
