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

resource "aws_s3_bucket" "forms" {
  bucket = "${var.namespace}-${var.stage}-test-forms"
  acl    = "private"
  versioning {
    enabled = true
  }
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "AES256"
      }
    }
 }
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "forms" {
  bucket = aws_s3_bucket.forms.id
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

module "dynamodb_table" {
  source                       = "cloudposse/dynamodb/aws"
  version                      = "0.29.4"
  name                         = "${var.stage}-${var.namespace}-forms"
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
    },
    {
      name = "GPK6"
      type = "S"
    },
    {
      name = "GSK6"
      type = "S"
    }
  ]
  global_secondary_index_map = [
    {
      name               = "FormID"
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
      name               = "Search_location"
      hash_key           = "GPK5"
      range_key          = "GSK5"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "LocationEnabledPriorityDate"
      hash_key           = "GPK6"
      range_key          = "GSK6"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    }
  ]
}

output "forms_s3_bucket" {
  value = resource.aws_s3_bucket.forms
}

output "forms_dynamodb_table" {
  value = module.dynamodb_table
}

output "dynamodb" {
  value = module.dynamodb_table
}
