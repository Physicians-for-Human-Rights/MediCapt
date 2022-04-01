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

variable "lambda_insights_layer" {
  description = "The layer arn for lambda insights in this region: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-extension-versionsx86-64.html"
  type        = string
}

variable "lambda_layer_modules" {
  description = "Access to the common js modules"
  type        = string
}

variable "dynamodb_point_in_time_recovery" {
  description = "Should we enable point in time recovery for this table"
  type        = bool
}

# NB The layout of this table is a bit unusual
# Nominally it is:
# the primary key is the human id, with a column for the machine id
# and a secondary global index has the reverse mapping
#
# But this setup doesn't enforce the uniqueness of the mapping. Two human ids
# could map onto the same machine id. Dynamo has no uniqueness constraints. To
# simulate uniqueness constraints we insert both ways of the mapping.
#
# This is the recommended approach
# https://aws.amazon.com/blogs/database/simulating-amazon-dynamodb-unique-constraints-using-transactions/

module "dynamodb_table" {
  source                       = "cloudposse/dynamodb/aws" 
  version                      = "0.29.4"
  name                         = "${var.stage}-${var.namespace}-humanid"
  enable_encryption	       = true
  enable_streams	       = false
  ttl_enabled	               = false
  # Once Medicapt scales sufficiently, it will be cheaper to configure autoscaling
  enable_autoscaler            = false
  billing_mode                 = "PAY_PER_REQUEST"
  autoscale_min_read_capacity  = null
  autoscale_min_write_capacity = null
  enable_point_in_time_recovery = var.dynamodb_point_in_time_recovery
  # NB The comment above to understand what is stored in the humanID key
  hash_key                     = "id1"
  hash_key_type	               = "S"
  range_key                    = ""
  range_key_type               = null
  dynamodb_attributes          = []
  global_secondary_index_map   = []
}

output "forms_dynamodb_table" {
  value = module.dynamodb_table
}
