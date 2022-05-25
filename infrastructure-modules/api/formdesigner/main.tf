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


resource "aws_api_gateway_rest_api" "formdesigner" {
  name        = "${var.namespace}-${var.stage}-formdesigner"
  description = "Form Designer API"
  body = templatefile("${path.module}/${var.api_file}",
    { cognito_user_pool_formdesigner_arn = var.cognito_user_pool_formdesigner_arn
      region = var.aws_region
      account_id = data.aws_caller_identity.current.account_id
      # NB: Is there a way to pass in a map and do a lookup?
      lambda_uri_formdesignerCreateForm          = aws_lambda_function.lambdas["formdesignerCreateForm"].invoke_arn
      lambda_uri_formdesignerGetForms            = aws_lambda_function.lambdas["formdesignerGetForms"].invoke_arn
      lambda_uri_formdesignerGetFormById         = aws_lambda_function.lambdas["formdesignerGetFormById"].invoke_arn
      lambda_uri_formdesignerUpdateFormById      = aws_lambda_function.lambdas["formdesignerUpdateFormById"].invoke_arn
      lambda_uri_formdesignerGetFormMetadataById = aws_lambda_function.lambdas["formdesignerGetFormMetadataById"].invoke_arn
      lambda_uri_formdesignerCommitFormById      = aws_lambda_function.lambdas["formdesignerCommitFormById"].invoke_arn
      lambda_uri_formdesignerGetUserById         = aws_lambda_function.lambdas["formdesignerGetUserById"].invoke_arn
      lambda_uri_formdesignerGetLocationById     = aws_lambda_function.lambdas["formdesignerGetLocationById"].invoke_arn
    })
  endpoint_configuration {
    types = [var.endpoint_configuration]
  }
}


resource "aws_api_gateway_deployment" "api" {
  # NB: Unfortunately, depends_on must be static in terraform.
  depends_on = [
    aws_api_gateway_rest_api.formdesigner,
    aws_lambda_function.lambdas["formdesignerCreateForm"],
    aws_lambda_function.lambdas["formdesignerGetForms"],
    aws_lambda_function.lambdas["formdesignerGetFormById"],
    aws_lambda_function.lambdas["formdesignerUpdateFormById"],
    aws_lambda_function.lambdas["formdesignerGetFormMetadataById"],
    aws_lambda_function.lambdas["formdesignerCommitFormById"],
    aws_lambda_function.lambdas["formdesignerGetUserById"],
    aws_lambda_function.lambdas["formdesignerGetLocationById"]
  ]
  rest_api_id = aws_api_gateway_rest_api.formdesigner.id
  # should be var.stage but see this issue, required for cloudwatch support
  # the stage itself is set up by aws_api_gateway_stage
  # https://github.com/hashicorp/terraform-provider-aws/issues/1153
  stage_name  = ""
  lifecycle {
    create_before_destroy = true
  }
  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.formdesigner.body))
  }
}

resource "aws_api_gateway_stage" "api" {
  # NB: Unfortunately, depends_on must be static in terraform.
  depends_on = [
    aws_api_gateway_deployment.api,
    aws_api_gateway_rest_api.formdesigner,
    aws_lambda_function.lambdas["formdesignerCreateForm"],
    aws_lambda_function.lambdas["formdesignerGetForms"],
    aws_lambda_function.lambdas["formdesignerGetFormById"],
    aws_lambda_function.lambdas["formdesignerUpdateFormById"],
    aws_lambda_function.lambdas["formdesignerGetFormMetadataById"],
    aws_lambda_function.lambdas["formdesignerCommitFormById"],
    aws_lambda_function.lambdas["formdesignerGetUserById"],
    aws_lambda_function.lambdas["formdesignerGetLocationById"]
  ]
  rest_api_id    = aws_api_gateway_rest_api.formdesigner.id
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
  rest_api_id = aws_api_gateway_rest_api.formdesigner.id
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
