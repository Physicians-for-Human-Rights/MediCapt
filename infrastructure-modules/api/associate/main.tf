# To reduce the blast radius of updates, we split the api.yaml file automatically with split-api.sh
# This produces subdirectories in apis/ for each path.
# The first entry of the path is removed since we assume it's a prefix for the kind of API we're making.
# A placeholder index.js will be provided if a new path is created.
# Update lambdas.tf nd then this file for every endpoint.
#
# Instead of touching every single endpoint, updating only changes one path now.
# User still have an api.yaml file for easy editing and documentation.
#
# Note that this process only creates directories, removing parts of an api.yaml doesn't delete anything.

terraform {
  required_version = ">= 1.1, < 1.2"
}

data "aws_caller_identity" "current" {}

resource "aws_api_gateway_rest_api" "associate" {
  name        = "${var.namespace}-${var.stage}-associate"
  description = "Associate API"
  body = templatefile("${path.module}/${var.api_file}",
    { cognito_user_pool_associate_arn = var.cognito_user_pool_associate_arn
      region = var.aws_region
      account_id = data.aws_caller_identity.current.account_id
      # NB: Is there a way to pass in a map and do a lookup?
      lambda_uri_associateGetSharedRecordById           = aws_lambda_function.lambdas["associateGetSharedRecordById"].invoke_arn
      lambda_uri_associateDeleteSharedRecordById        = aws_lambda_function.lambdas["associateDeleteSharedRecordById"].invoke_arn
      lambda_uri_associateGetRecordShares               = aws_lambda_function.lambdas["associateGetRecordShares"].invoke_arn
      lambda_uri_associateGetUserById                   = aws_lambda_function.lambdas["associateGetUserById"].invoke_arn
      lambda_uri_associateGetUserByUUID                 = aws_lambda_function.lambdas["associateGetUserByUUID"].invoke_arn
      lambda_uri_associateGetUserByUUIDAnyPool          = aws_lambda_function.lambdas["associateGetUserByUUIDAnyPool"].invoke_arn
      lambda_uri_associateGetLocationById               = aws_lambda_function.lambdas["associateGetLocationById"].invoke_arn
    })
  endpoint_configuration {
    types = [var.endpoint_configuration]
  }
}

resource "aws_api_gateway_deployment" "api" {
  # NB: Unfortunately, depends_on must be static in terraform.
  depends_on = [
    aws_api_gateway_rest_api.associate,
    aws_lambda_function.lambdas["associateGetSharedRecordById"],
    aws_lambda_function.lambdas["associateDeleteSharedRecordById"],
    aws_lambda_function.lambdas["associateGetRecordShares"],
    aws_lambda_function.lambdas["associateGetUserById"],
    aws_lambda_function.lambdas["associateGetUserByUUID"],
    aws_lambda_function.lambdas["associateGetUserByUUIDAnyPool"],
    aws_lambda_function.lambdas["associateGetLocationById"]
  ]
  rest_api_id = aws_api_gateway_rest_api.associate.id
  # should be var.stage but see this issue, required for cloudwatch support
  # the stage itself is set up by aws_api_gateway_stage
  # https://github.com/hashicorp/terraform-provider-aws/issues/1153
  stage_name  = ""
  lifecycle {
    create_before_destroy = true
  }
  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.associate.body))
  }
}

resource "aws_api_gateway_stage" "api" {
  # NB: Unfortunately, depends_on must be static in terraform.
  depends_on = [
    aws_api_gateway_deployment.api,
    aws_api_gateway_rest_api.associate,
    aws_lambda_function.lambdas["associateGetSharedRecordById"],
    aws_lambda_function.lambdas["associateDeleteSharedRecordById"],
    aws_lambda_function.lambdas["associateGetRecordShares"],
    aws_lambda_function.lambdas["associateGetUserById"],
    aws_lambda_function.lambdas["associateGetUserByUUID"],
    aws_lambda_function.lambdas["associateGetUserByUUIDAnyPool"],
    aws_lambda_function.lambdas["associateGetLocationById"]
  ]
  rest_api_id    = aws_api_gateway_rest_api.associate.id
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
  rest_api_id = aws_api_gateway_rest_api.associate.id
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
