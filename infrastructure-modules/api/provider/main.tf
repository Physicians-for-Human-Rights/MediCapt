# To reduce the blast radius of updates, we split the api.yaml file automatically with split-api.sh
# This produces subdirectories in apis/ for each path.
# The first entry of the path is removed since we assume it's a prefix for the kind of API we're making.
# A placeholder index.js will be provided if a new path is created.
# Update lambdas.tf nd then this file for every endpoint.
#
# Instead of touching every single endpoint, updating only changes one path now.
# You still have an api.yaml file for easy editing and documentation.
#
# Note that this process only creates directories, removing parts of an api.yaml doesn't delete anything.

terraform {
  required_version = ">= 1.1, < 1.2"
}

data "aws_caller_identity" "current" {}

resource "aws_api_gateway_rest_api" "provider" {
  name        = "${var.namespace}-${var.stage}-provider"
  description = "Provider API"
  body = templatefile("${path.module}/${var.api_file}",
    { cognito_user_pool_provider_arn = var.cognito_user_pool_provider_arn
      region = var.aws_region
      account_id = data.aws_caller_identity.current.account_id
      # NB: Is there a way to pass in a map and do a lookup?
      lambda_uri_providerGetForms              = aws_lambda_function.lambdas["providerGetForms"].invoke_arn
      lambda_uri_providerGetFormById           = aws_lambda_function.lambdas["providerGetFormById"].invoke_arn
      lambda_uri_providerGetFormByIdAndVersion = aws_lambda_function.lambdas["providerGetFormByIdAndVersion"].invoke_arn
      lambda_uri_providerGetUsers              = aws_lambda_function.lambdas["providerGetUsers"].invoke_arn
      lambda_uri_providerGetUserById           = aws_lambda_function.lambdas["providerGetUserById"].invoke_arn
      lambda_uri_providerGetUserByUUID         = aws_lambda_function.lambdas["providerGetUserByUUID"].invoke_arn
      lambda_uri_providerGetUserByUUIDAnyPool  = aws_lambda_function.lambdas["providerGetUserByUUIDAnyPool"].invoke_arn
      lambda_uri_providerGetLocationById       = aws_lambda_function.lambdas["providerGetLocationById"].invoke_arn
      lambda_uri_providerCreateRecord          = aws_lambda_function.lambdas["providerCreateRecord"].invoke_arn
      lambda_uri_providerGetRecords            = aws_lambda_function.lambdas["providerGetRecords"].invoke_arn
      lambda_uri_providerGetRecordById         = aws_lambda_function.lambdas["providerGetRecordById"].invoke_arn
      lambda_uri_providerUpdateRecordById      = aws_lambda_function.lambdas["providerUpdateRecordById"].invoke_arn
      lambda_uri_providerGetRecordMetadataById = aws_lambda_function.lambdas["providerGetRecordMetadataById"].invoke_arn
      lambda_uri_providerCommitRecordById      = aws_lambda_function.lambdas["providerCommitRecordById"].invoke_arn
      lambda_uri_providerPatchRecordById       = aws_lambda_function.lambdas["providerPatchRecordById"].invoke_arn
      lambda_uri_providerSealRecordById        = aws_lambda_function.lambdas["providerSealRecordById"].invoke_arn
      lambda_uri_providerGetRecordShares       = aws_lambda_function.lambdas["providerGetRecordShares"].invoke_arn
      lambda_uri_providerCreateShareByRecordId = aws_lambda_function.lambdas["providerCreateShareByRecordId"].invoke_arn
      lambda_uri_providerGetSharesByRecordId   = aws_lambda_function.lambdas["providerGetSharesByRecordId"].invoke_arn
      lambda_uri_providerUpdateShareByShareId  = aws_lambda_function.lambdas["providerUpdateShareByShareId"].invoke_arn
      lambda_uri_providerGetRecordByShareId    = aws_lambda_function.lambdas["providerGetRecordByShareId"].invoke_arn
      lambda_uri_providerDeleteShareByShareId  = aws_lambda_function.lambdas["providerDeleteShareByShareId"].invoke_arn
    })
  endpoint_configuration {
    types = [var.endpoint_configuration]
  }
}

resource "aws_api_gateway_deployment" "api" {
  # NB: Unfortunately, depends_on must be static in terraform.
  depends_on = [
    aws_api_gateway_rest_api.provider,
    aws_lambda_function.lambdas["providerGetForms"],
    aws_lambda_function.lambdas["providerGetFormById"],
    aws_lambda_function.lambdas["providerGetFormByIdAndVersion"],
    aws_lambda_function.lambdas["providerGetUsers"],
    aws_lambda_function.lambdas["providerGetUserById"],
    aws_lambda_function.lambdas["providerGetUserByUUID"],
    aws_lambda_function.lambdas["providerGetUserByUUIDAnyPool"],
    aws_lambda_function.lambdas["providerGetLocationById"],
    aws_lambda_function.lambdas["providerCreateRecord"],
    aws_lambda_function.lambdas["providerGetRecords"],
    aws_lambda_function.lambdas["providerGetRecordById"],
    aws_lambda_function.lambdas["providerUpdateRecordById"],
    aws_lambda_function.lambdas["providerGetRecordMetadataById"],
    aws_lambda_function.lambdas["providerCommitRecordById"],
    aws_lambda_function.lambdas["providerPatchRecordById"],
    aws_lambda_function.lambdas["providerSealRecordById"],
    aws_lambda_function.lambdas["providerGetRecordShares"],
    aws_lambda_function.lambdas["providerCreateShareByRecordId"],
    aws_lambda_function.lambdas["providerGetSharesByRecordId"],
    aws_lambda_function.lambdas["providerUpdateShareByShareId"],
    aws_lambda_function.lambdas["providerGetRecordByShareId"],
    aws_lambda_function.lambdas["providerDeleteShareByShareId"]
  ]
  rest_api_id = aws_api_gateway_rest_api.provider.id
  # should be var.stage but see this issue, required for cloudwatch support
  # the stage itself is set up by aws_api_gateway_stage
  # https://github.com/hashicorp/terraform-provider-aws/issues/1153
  stage_name  = ""
  lifecycle {
    create_before_destroy = true
  }
  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.provider.body))
  }
}

resource "aws_api_gateway_stage" "api" {
  # NB: Unfortunately, depends_on must be static in terraform.
  depends_on = [
    aws_api_gateway_deployment.api,
    aws_api_gateway_rest_api.provider,
    aws_lambda_function.lambdas["providerGetForms"],
    aws_lambda_function.lambdas["providerGetFormById"],
    aws_lambda_function.lambdas["providerGetFormByIdAndVersion"],
    aws_lambda_function.lambdas["providerGetUsers"],
    aws_lambda_function.lambdas["providerGetUserById"],
    aws_lambda_function.lambdas["providerGetUserByUUID"],
    aws_lambda_function.lambdas["providerGetUserByUUIDAnyPool"],
    aws_lambda_function.lambdas["providerGetLocationById"],
    aws_lambda_function.lambdas["providerCreateRecord"],
    aws_lambda_function.lambdas["providerGetRecords"],
    aws_lambda_function.lambdas["providerGetRecordById"],
    aws_lambda_function.lambdas["providerUpdateRecordById"],
    aws_lambda_function.lambdas["providerGetRecordMetadataById"],
    aws_lambda_function.lambdas["providerCommitRecordById"],
    aws_lambda_function.lambdas["providerPatchRecordById"],
    aws_lambda_function.lambdas["providerSealRecordById"],
    aws_lambda_function.lambdas["providerGetRecordShares"],
    aws_lambda_function.lambdas["providerCreateShareByRecordId"],
    aws_lambda_function.lambdas["providerGetSharesByRecordId"],
    aws_lambda_function.lambdas["providerUpdateShareByShareId"],
    aws_lambda_function.lambdas["providerGetRecordByShareId"],
    aws_lambda_function.lambdas["providerDeleteShareByShareId"]
  ]
  rest_api_id    = aws_api_gateway_rest_api.provider.id
  stage_name     = var.stage
  deployment_id  = aws_api_gateway_deployment.api.id
  xray_tracing_enabled = true
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format				= "$context.error.message,$context.error.messageString,$context.identity.sourceIp,$context.identity.caller,$context.identity.user,$context.requestTime,$context.httpMethod,$context.resourcePath,$context.protocol,$context.status,$context.responseLength,$context.requestId"
  }
}

resource "aws_api_gateway_method_settings" "settings" {
  depends_on = [
    aws_api_gateway_deployment.api,
    aws_api_gateway_stage.api,
    aws_api_gateway_account.api
  ]
  rest_api_id = aws_api_gateway_rest_api.provider.id
  stage_name  = var.stage
  method_path = "*/*"
  settings {
    metrics_enabled = true
    logging_level = "INFO"
    data_trace_enabled = true
  }
}

resource "aws_api_gateway_account" "api" {
  cloudwatch_role_arn = aws_iam_role.cloudwatch.arn
}
