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
  name                         = "${var.namespace}-${var.stage}-location"
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
  hash_key                     = "PK"
  hash_key_type	               = "S"
  range_key                    = "SK"
  range_key_type               = "S"
  dynamodb_attributes = [
    #
    # Terraform only wants the fields which serve as indexes.
    #
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
      name               = "LocationID"
      hash_key           = "GPK1"
      range_key          = "GSK1"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "LastChangeDate"
      hash_key           = "GPK2"
      range_key          = "GSK2"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "Search_language"
      hash_key           = "GPK3"
      range_key          = "GSK3"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "Search_country"
      hash_key           = "GPK4"
      range_key          = "GSK4"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "Search_entityType"
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

output "dynamodb" {
  value = module.dynamodb_table
}
