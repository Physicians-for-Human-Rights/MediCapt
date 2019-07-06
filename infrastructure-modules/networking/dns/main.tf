terraform {
  required_version = ">= 0.12, < 0.13"
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region
  version = "~> 2.0"
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

variable "domain_name" {
  description = "Site domain name"
  type        = string
}

data "aws_route53_zone" "root" {
  name         = "${var.domain_name}."
}

resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  subject_alternative_names = [
    "cognito.${var.domain_name}",
    "www.${var.domain_name}",
    "prod.${var.domain_name}",
    "dev.${var.domain_name}",
    "gamma.${var.domain_name}",
    "beta.${var.domain_name}",
    "alpha.${var.domain_name}",
    "stage.${var.domain_name}"
  ]
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_s3_bucket" "public_site" {
    bucket = "${var.domain_name}"
    acl = "public-read"
    policy = <<EOF
{
  "Id": "bucket_policy_site",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "bucket_policy_site_main",
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${var.domain_name}/*",
      "Principal": "*"
    }
  ]
}
EOF
    website {
        index_document = "index.html"
        error_document = "404.html"
    }
}

resource "aws_route53_record" "domain" {
   name = "${var.domain_name}"
   zone_id = "${data.aws_route53_zone.root.zone_id}"
   type = "A"
   alias {
     name = aws_s3_bucket.public_site.website_domain
     zone_id = aws_s3_bucket.public_site.hosted_zone_id
     evaluate_target_health = true
   }
}

output "acm-certificate" {
  value = aws_acm_certificate.cert
  description = "ACM certificate for this domain"
}

output "site-bucket" {
  value = aws_s3_bucket.public_site
  description = "S3 bucket for the public site."
}
