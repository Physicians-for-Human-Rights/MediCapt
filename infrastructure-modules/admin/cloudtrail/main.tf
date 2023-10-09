terraform {
  required_version = ">= 1.1, < 1.2"
}

variable "stage" {
  description = "Development stage, e.g., prod."
  type        = string
}

variable "namespace" {
  description = "The namespace of the app, e.g., medicapt"
  type        = string
}

module "s3_bucket" {
  source = "cloudposse/cloudtrail-s3-bucket/aws"
  version     = "0.23.1"
  acl    = "private"
  name      = "${var.stage}-${var.namespace}-test-cloudtrail"
}

module "cloudtrail" {
  source = "cloudposse/cloudtrail/aws"
  version     = "0.21.0"
  name                          = "${var.stage}-${var.namespace}"
  enable_log_file_validation    = true
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_logging                = true
  s3_bucket_name                = "${var.stage}-${var.namespace}-test-cloudtrail"
}

output "cloudtrail_bucket_name" {
  value = module.s3_bucket.bucket_id
}
