module "s3_bucket" {
  source                       = "cloudposse/s3-bucket/aws"
  version                      = "0.46.0"
  acl                          = "private"
  enabled                      = true
  user_enabled                 = false
  versioning_enabled           = true
  sse_algorithm                = "aws:kms"
  bucket_key_enabled           = true
  allow_encrypted_uploads_only = true
  name                         = "${var.stage}-${var.namespace}-reidentification"
}

output "reidentification_s3_bucket_arn" {
  value = module.s3_bucket.bucket_arn
}

output "reidentification_s3_bucket_id" {
  value = module.s3_bucket.bucket_id
}
