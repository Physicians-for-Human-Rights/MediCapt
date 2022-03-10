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

module "dynamodb_table" {
  source = "cloudposse/dynamodb/aws"
  version     = "0.29.4"
  name                         = "${var.namespace}-${var.stage}-user-logs"
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
  hash_key                     = "userUUID"
  hash_key_type	               = "S"
  range_key                    = "date"
  range_key_type               = "S"
  dynamodb_attributes = [
    {
      name = "legalName"
      type = "S"
    },
    {
      name = "locationUUID"
      type = "S"
    },
    {
      name = "entityType_country"
      type = "S"
    }
  ]
  global_secondary_index_map = [
    {
      name               = "RecordsByProviderCreated"
      hash_key           = "entityType"
      range_key          = "country"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "RecordsByProviderCompleted"
      hash_key           = "entityType_country"
      range_key          = "locationUUID"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "EntityTypes"
      hash_key           = "legalName"
      range_key          = null
      projection_type    = "INCLUDE"
      non_key_attributes = ["entityType"]
      #
      read_capacity      = null
      write_capacity     = null
    }
  ]
}

output "dynamodb" {
  value = module.dynamodb_table
}
