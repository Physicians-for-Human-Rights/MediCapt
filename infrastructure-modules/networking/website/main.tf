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

variable "domain_name" {
  description = "The domain name, e.g., medicapt.com"
  type        = string
}

resource "aws_route53_zone" "primary" {
  name = "medicapt.click"
}

module "acm_request_certificate" {
  source = "cloudposse/acm-request-certificate/aws"
  version = "0.16.0"
  # This must run in us-east-1!
  providers = {
    aws = aws.us-east-1
  }
  stage                             = "${var.stage}"
  # This is something like prod.medicapt.com
  domain_name                       = "${var.stage}.${var.domain_name}"
  process_domain_validation_options = true
  ttl                               = "300"
  zone_id                           = aws_route53_zone.primary.zone_id
  wait_for_certificate_issued       = true
  subject_alternative_names         = ["*.${var.stage}.${var.domain_name}"]
}

module "cdn" {
  source              = "cloudposse/cloudfront-s3-cdn/aws"
  version             = "0.81.0"
  name                = "medicapt"
  stage               = "${var.stage}"
  aliases             = ["${var.stage}.${var.domain_name}"]
  dns_alias_enabled   = true
  parent_zone_id      = aws_route53_zone.primary.zone_id
  acm_certificate_arn = module.acm_request_certificate.arn
  depends_on          = [module.acm_request_certificate]
  wait_for_deployment = true
}

module "template_files" {
  source = "hashicorp/dir/template"
  version = "1.0.2"
  base_dir = "${path.module}/src"
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
  bucket       = module.cdn.s3_bucket
}

output "domain_name" {
  value = "${var.stage}.${var.domain_name}"
  description = "The domain name we deployed"
}

output "hosted_zone_id" {
  value = aws_route53_zone.primary.zone_id
  description = "Hosted zone id"
}

output "acm_arn" {
  value = module.acm_request_certificate.arn
  description = "ACM ARN"
}

output "acm_id" {
  value = module.acm_request_certificate.id
  description = "ACM id"
}

output "bucket" {
  value = module.cdn.s3_bucket
  description = "S3 bucket"
}

