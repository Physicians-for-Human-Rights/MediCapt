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
  access_key = "test"
  secret_key = "test"
  profile = "test"
  region = "us-east-1"
  s3_force_path_style         = false
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  endpoints {
    acm            = "http://localhost:4566"
    athena         = "http://localhost:4566"
    apigateway     = "http://localhost:4566"
    apigatewayv2   = "http://localhost:4566"
    budgets        = "http://localhost:4566"
    cognitoidentity= "http://localhost:4566"
    cognitoidp     = "http://localhost:4566"
    cognitoidentityprovider= "http://localhost:4566"
    cognitosync    = "http://localhost:4566"
    cloudformation = "http://localhost:4566"
    cloudwatch     = "http://localhost:4566"
    cloudwatchlogs = "http://localhost:4566"
    cloudtrail     = "http://localhost:4566"
    cloudfront     = "http://localhost:4566"
    config         = "http://localhost:4566"
    dynamodb       = "http://localhost:4566"
    ec2            = "http://localhost:4566"
    es             = "http://localhost:4566"
    elasticache    = "http://localhost:4566"
    firehose       = "http://localhost:4566"
    iam            = "http://localhost:4566"
    kinesis        = "http://localhost:4566"
    lambda         = "http://localhost:4566"
    rds            = "http://localhost:4566"
    redshift       = "http://localhost:4566"
    route53        = "http://localhost:4566"
    route53domains = "http://localhost:4566"
    route53recoverycontrolconfig = "http://localhost:4566"
    route53recoveryreadiness = "http://localhost:4566"
    route53resolver = "http://localhost:4566"
    s3             = "http://s3.localhost.localstack.cloud:4566"
    secretsmanager = "http://localhost:4566"
    ses            = "http://localhost:4566"
    sns            = "http://localhost:4566"
    sqs            = "http://localhost:4566"
    ssm            = "http://localhost:4566"
    stepfunctions  = "http://localhost:4566"
    sts            = "http://localhost:4566"
    kms            = "http://localhost:4566"
  }
}
provider "aws" {
  alias  = "us-east-1"
  access_key = "test"
  secret_key = "test"
  profile = "test"
  region = "us-east-1"
  s3_force_path_style         = false
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  endpoints {
    acm            = "http://localhost:4566"
    athena         = "http://localhost:4566"
    apigateway     = "http://localhost:4566"
    apigatewayv2   = "http://localhost:4566"
    budgets        = "http://localhost:4566"
    cognitoidentity= "http://localhost:4566"
    cognitoidp     = "http://localhost:4566"
    cognitoidentityprovider= "http://localhost:4566"
    cognitosync    = "http://localhost:4566"
    cloudformation = "http://localhost:4566"
    cloudwatch     = "http://localhost:4566"
    cloudwatchlogs = "http://localhost:4566"
    cloudtrail     = "http://localhost:4566"
    cloudfront     = "http://localhost:4566"
    config         = "http://localhost:4566"
    dynamodb       = "http://localhost:4566"
    ec2            = "http://localhost:4566"
    es             = "http://localhost:4566"
    elasticache    = "http://localhost:4566"
    firehose       = "http://localhost:4566"
    iam            = "http://localhost:4566"
    kinesis        = "http://localhost:4566"
    lambda         = "http://localhost:4566"
    rds            = "http://localhost:4566"
    redshift       = "http://localhost:4566"
    route53        = "http://localhost:4566"
    route53domains = "http://localhost:4566"
    route53recoverycontrolconfig = "http://localhost:4566"
    route53recoveryreadiness = "http://localhost:4566"
    route53resolver = "http://localhost:4566"
    s3             = "http://s3.localhost.localstack.cloud:4566"
    secretsmanager = "http://localhost:4566"
    ses            = "http://localhost:4566"
    sns            = "http://localhost:4566"
    sqs            = "http://localhost:4566"
    ssm            = "http://localhost:4566"
    stepfunctions  = "http://localhost:4566"
    sts            = "http://localhost:4566"
    kms            = "http://localhost:4566"
  }
}
terraform {
  backend "local" {}
  required_providers {
    aws = {
      version = "~> 3.0"
    }
  }
}
EOF
}

generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents  = ""
}

inputs = merge(
  local.region_vars.locals,
  local.stage_vars.locals,
)
