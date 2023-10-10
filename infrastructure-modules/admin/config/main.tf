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

variable "cloudtrail_bucket_name" {
  description = "Bucket where cloudtrail is placing logs"
  type        = string
}

variable "support_role_arns" {
  description = "A list of ARNs that can become support roles"
  type        = list(string)
}

module "aws_config_storage" {
  source  = "cloudposse/config-storage/aws"
  version = "0.4.0"
  name    = "${var.stage}-${var.namespace}-test-config"
}

module "aws_config" {
  source           = "cloudposse/config/aws"
  version          = "0.15.1"
  name             = "${var.stage}-${var.namespace}"
  # TODO Notifications aren't going anywhere
  create_sns_topic = true
  create_iam_role  = true
  s3_bucket_id     = module.aws_config_storage.bucket_id
  s3_bucket_arn    = module.aws_config_storage.bucket_arn
  # TODO This assumes we have a us-east-1 deployment
  global_resource_collector_region = "us-east-1"
}

module "hipaa_conformance_pack" {
  source  = "cloudposse/config/aws//modules/conformance-pack"
  version = "0.15.1"
  name    = "operational-best-practices-for-HIPAA-Security"
  conformance_pack = "https://raw.githubusercontent.com/awslabs/aws-config-rules/master/aws-config-conformance-packs/Operational-Best-Practices-for-HIPAA-Security.yaml"
  depends_on = [
    module.aws_config
  ]
}

module "cis_1_2_rules" {
  source = "cloudposse/config/aws//modules/cis-1-2-rules"
  version = "0.15.1"
  is_global_resource_region = true
  is_logging_account        = true
  support_policy_arn        = aws_iam_role.support.arn
  cloudtrail_bucket_name    = var.cloudtrail_bucket_name
  depends_on = [
    module.aws_config
  ]
}

output "config_recorder_id" {
  value       = module.aws_config.aws_config_configuration_recorder_id
  description = "The id of the AWS Config Recorder that was created"
}

output "storage_bucket_id" {
  value       = module.aws_config_storage.bucket_id
  description = "Bucket Name (aka ID)"
}

output "storage_bucket_arn" {
  value       = module.aws_config_storage.bucket_arn
  description = "Bucket ARN"
}

output "conformance_pack_arn" {
  value       = module.hipaa_conformance_pack.arn
  description = "Conformance Pack ARN"
}

#### Add a support role

data "aws_iam_policy_document" "support_assume_policy" {
  statement {
    principals {
      type        = "AWS"
      identifiers = var.support_role_arns
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "support" {
  name               = "MedicaptSupport"
  assume_role_policy = data.aws_iam_policy_document.support_assume_policy.json
}

resource "aws_iam_role_policy_attachment" "support_policy" {
  role       = aws_iam_role.support.id
  policy_arn = "arn:aws:iam::aws:policy/AWSSupportAccess"
}
