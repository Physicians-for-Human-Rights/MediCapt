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

# Images and form definitions are stored in this S3 bucket as in:
# <country-code>/<form-code>
# For example: KE/ke-moh-363-2019

resource "aws_s3_bucket" "forms" {
  bucket = "${var.namespace}-${var.stage}-forms"
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
}

resource "aws_s3_bucket_public_access_block" "forms" {
  bucket = resource.aws_s3_bucket.forms.id
  block_public_acls   = true
  block_public_policy = true
  restrict_public_buckets = true
}

module "template_files" {
  source = "hashicorp/dir/template"
  version = "1.0.2"
  base_dir = "${path.module}/default-forms"
  template_vars = {
  }
}

resource "aws_s3_bucket_object" "static_files" {
  #checkov:skip=CKV_AWS_186:Letting AWS manage keys is safer here
  for_each     = module.template_files.files
  key          = each.key
  content_type = each.value.content_type
  source       = each.value.source_path
  content      = each.value.content
  etag         = each.value.digests.md5
  #
  bucket       = aws_s3_bucket.forms.id
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
  hash_key                     = "country"
  hash_key_type	               = "S"
  range_key                    = "formUUID"
  range_key_type               = "S"
  dynamodb_attributes = [
    #
    # Fields here are commented out because terraform only wants the fields
    # which serve as indexes. But for the purposes of documentation, we list all
    # fields we intend to use.
    #
    { name = "country"
      type = "S"
    },
    { name = "formUUID"
      type ="S"
    },
    {
      name = "priority"
      type = "S"
    },
    {
      name = "country_locationUUID"
      type = "S"
    },
    {
      name = "country_locationUUID_enabled"
      type = "S"
    }
  ]
  global_secondary_index_map = [
    {
      name               = "AllActiveTagsByLocation"
      hash_key           = "country_locationUUID_enabled"
      range_key          = null
      projection_type    = "INCLUDE"
      non_key_attributes = ["Tag"]
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "AllLocationsByCountry"
      hash_key           = "country"
      range_key          = null
      projection_type    = "INCLUDE"
      non_key_attributes = ["locationUUID"]
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "AllLanguagesByCountry"
      hash_key           = "country"
      range_key          = null
      projection_type    = "INCLUDE"
      non_key_attributes = ["language"]
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "ByUUID"
      hash_key           = "formUUID"
      range_key          = null
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "PriorityForms"
      hash_key           = "country_locationUUID"
      range_key          = "priority"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    },
    {
      name               = "PriorityEnabledForms"
      hash_key           = "country_locationUUID_enabled"
      range_key          = "priority"
      projection_type    = "ALL"
      non_key_attributes = null
      #
      read_capacity      = null
      write_capacity     = null
    }
  ]
}

resource "aws_dynamodb_table_item" "example" {
  table_name = module.dynamodb_table.table_name
  hash_key   = "country"
  range_key  = "formUUID"
  item = <<ITEM
{
   "country": { "S": "KE" },
   "formUUID": { "S": "617a8795-229c-4aa2-bdb1-e4b8fb344e32" },
   "locationUUID": { "S": "" },
   "name": { "S": "Post-rape care form" },
   "subtitle": { "S": "Keyna MOH 363" },
   "dateEntered": { "S": "2019-01-01" },
   "dateCreated": { "S": "2019-01-01" },
   "formId": { "S": "Keyna MOH 363" },
   "tag": { "S": "sexual-assault" },
   "priority": { "S": "1" },
   "version": { "S": "1" },
   "enabled": { "S": "1" },
   "country_locationUUID": { "S": "KE!" },
   "country_locationUUID_enabled": { "S": "KE!!1" },
   "country_locationUUID_enabled_tag": { "S": "KE!!1!sexual-assault" }
}
ITEM
}

output "forms_s3_bucket" {
  value = resource.aws_s3_bucket.forms
}

output "forms_dynamodb_table" {
  value = module.dynamodb_table
}
