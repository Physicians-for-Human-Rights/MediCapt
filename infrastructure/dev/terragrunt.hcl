locals {
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  stage_vars  = read_terragrunt_config(find_in_parent_folders("stage.hcl"))

  account_id  = local.stage_vars.locals.account_id
  stage       = local.stage_vars.locals.stage
  namespace   = local.stage_vars.locals.namespace
  aws_region  = local.region_vars.locals.aws_region
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "${local.aws_region}"
  # Only these AWS Account IDs may be operated on, to avoid mistakes
  allowed_account_ids = ["${local.account_id}"]
}
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}
terraform {
  required_providers {
    aws = {
      version = "~> 3.0"
    }
  }
}
EOF
}

# NB Terragrunt versions the bucket automatically.
remote_state {
  backend = "s3"
  config = {
    encrypt                   = true
    bucket                    = "${local.namespace}-terraform-state-test-${local.stage}"
    key                       = "${path_relative_to_include()}/terraform.tfstate"
    region                    = local.aws_region
    dynamodb_table            = "${local.namespace}-terraform-locks-${local.stage}"
    accesslogging_bucket_name = "${local.namespace}-terraform-state-logs-test-${local.stage}"
  }
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

inputs = merge(
  local.region_vars.locals,
  local.stage_vars.locals,
)
