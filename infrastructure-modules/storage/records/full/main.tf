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

variable "records_bucket_privileged_principal_arns" {
  description = "The principal ARNs which will be graned extra permissions to bucket prefixes"
  type        = map(list(string))
}

variable "records_bucket_kms_deletion_window_in_days" {
  description = "Days of protection you want for your KMS for S3"
  type        = number
}

module "kms_key" {
  source                   = "cloudposse/kms-key/aws"
  version                  = "0.12.1"
  name                     = "${var.stage}-${var.namespace}-records-s3"
  description              = "Key for the records S3 bucket"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  deletion_window_in_days  = var.records_bucket_kms_deletion_window_in_days
  enable_key_rotation      = true
  key_usage                = "ENCRYPT_DECRYPT"
  alias                    = "alias/records_s3_key"
}

module "s3_bucket" {
  source                       = "cloudposse/s3-bucket/aws"
  version                      = "0.46.0"
  acl                          = "private"
  enabled                      = true
  user_enabled                 = false
  versioning_enabled           = true
  sse_algorithm                = "aws:kms"
  allow_encrypted_uploads_only = true
  kms_master_key_arn           = module.kms_key.key_arn
  #
  allowed_bucket_actions       = [
    "s3:GetObject",
    "s3:PutObject",
    "s3:PutObjectTagging"
  ]
  name                         = "${var.stage}-${var.namespace}-test-records"
  privileged_principal_arns    = var.records_bucket_privileged_principal_arns
  privileged_principal_actions = [
    "s3:PutObject", 
    "s3:GetObject", 
    "s3:DeleteObject", 
    "s3:PutObjectTagging",
    "s3:GetObjectTagging",
    "s3:ListBucket", 
    "s3:ListBucketMultipartUploads", 
    "s3:ListBucketVersions", 
    "s3:GetBucketLocation", 
    "s3:GetBucketLogging", 
    "s3:GetBucketPolicy", 
    "s3:GetBucketWebsite", 
    "s3:AbortMultipartUpload"
  ]
  cors_rule_inputs = [{
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }]
}

output "records_s3_bucket" {
  # NB There is nothing sensitive here.
  # This module outputs empty sensitive values that we don't configure or use.
  sensitive = true
  value = module.s3_bucket
}

output "records_s3_bucket_kms" {
  value = module.kms_key
}
