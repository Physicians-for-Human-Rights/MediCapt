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
  name                         = "${var.namespace}-${var.stage}-record-metadata"
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
  hash_key                     = "locationUUID"
  hash_key_type	               = "S"
  range_key                    = "recordUUID"
  range_key_type               = "S"
  dynamodb_attributes = [
    #
    # Terraform only wants the fields which serve as indexes.
    #
    {
      name = "providerCreatedUUID"
      type = "S"
    },
    {
      name = "providerCompletedUUID"
      type = "S"
    },
    {
      name = "lastChangeDate"
      type = "S"
    }
  ]
  global_secondary_index_map = [
    {
      name               = "RecordsByProviderCreated"
      hash_key           = "providerCreatedUUID"
      range_key          = "lastChangeDate"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "RecordsByProviderCompleted"
      hash_key           = "providerCompletedUUID"
      range_key          = "lastChangeDate"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "RecordsByLocation"
      hash_key           = "locationUUID"
      range_key          = "lastChangeDate"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    }
  ]
}

output "dynamodb" {
  value = module.dynamodb_table
}
