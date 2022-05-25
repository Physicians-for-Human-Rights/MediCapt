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

variable "hosted_zone_id" {
  description = "The zone from which we will send emails"
  type        = string
}

variable "domain_name" {
  description = "The domain name we will send emails from"
  type        = string
}

# TODO Set up a bucket to receive email
#      Set up an inbox to receive bounces
module "ses_domain" {
  source             = "trussworks/ses-domain/aws"
  domain_name        = var.domain_name
  mail_from_domain   = "email.${var.domain_name}"
  route53_zone_id    = var.hosted_zone_id
  dmarc_rua          = "dmarc@${var.domain_name}"
  enable_incoming_email	 = false
}
 
output "ses_identity_arn" {
  value = module.ses_domain.ses_identity_arn
}
