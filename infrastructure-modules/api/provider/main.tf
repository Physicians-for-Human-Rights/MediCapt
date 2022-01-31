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
  body = templatefile("${path.module}/api.yaml",
    { cognito_user_pool_provider_arn = var.cognito_user_pool_provider_arn
      region = var.aws_region
      account_id = data.aws_caller_identity.current.account_id
      # NB: Is there a way to pass in a map and do a lookup?
      lambda_uri_providerCreateRecord                  = aws_lambda_function.lambdas["providerCreateRecord"].invoke_arn
      lambda_uri_providerGetRecordById                 = aws_lambda_function.lambdas["providerGetRecordById"].invoke_arn
      lambda_uri_providerUpdateRecordById              = aws_lambda_function.lambdas["providerUpdateRecordById"].invoke_arn
      lambda_uri_providerDeleteRecordById              = aws_lambda_function.lambdas["providerDeleteRecordById"].invoke_arn
      lambda_uri_providerSealRecordById                = aws_lambda_function.lambdas["providerSealRecordById"].invoke_arn
      lambda_uri_providerUploadImageForRecordBy        = aws_lambda_function.lambdas["providerUploadImageForRecordBy"].invoke_arn
      lambda_uri_providerGetImageByFormTag             = aws_lambda_function.lambdas["providerGetImageByFormTag"].invoke_arn
      lambda_uri_providerDeleteImageByFormTag          = aws_lambda_function.lambdas["providerDeleteImageByFormTag"].invoke_arn
      lambda_uri_providerGetOwnRecords                 = aws_lambda_function.lambdas["providerGetOwnRecords"].invoke_arn
      lambda_uri_providerGetFormsByCountry             = aws_lambda_function.lambdas["providerGetFormsByCountry"].invoke_arn
      lambda_uri_providerGetFormByUUID                 = aws_lambda_function.lambdas["providerGetFormByUUID"].invoke_arn
      lambda_uri_providerPutSharedRecordById           = aws_lambda_function.lambdas["providerPutSharedRecordById"].invoke_arn
      lambda_uri_providerGetRecordSharesById           = aws_lambda_function.lambdas["providerGetRecordSharesById"].invoke_arn
      lambda_uri_providerGetSharedRecordById           = aws_lambda_function.lambdas["providerGetSharedRecordById"].invoke_arn
      lambda_uri_providerDeleteSharedRecordById        = aws_lambda_function.lambdas["providerDeleteSharedRecordById"].invoke_arn
      lambda_uri_providerGetSharedRecordImageByFormTag = aws_lambda_function.lambdas["providerGetSharedRecordImageByFormTag"].invoke_arn
      lambda_uri_providerGetSharedRecordsByUser        = aws_lambda_function.lambdas["providerGetSharedRecordsByUser"].invoke_arn
      lambda_uri_providerGetSharedRecordsWithUser      = aws_lambda_function.lambdas["providerGetSharedRecordsWithUser"].invoke_arn
    })
  endpoint_configuration {
    types = [var.endpoint_configuration]
  }
}

resource "aws_api_gateway_deployment" "api" {
  # NB: Unfortunately, depends_on must be static in terraform.
  depends_on = [
    aws_api_gateway_rest_api.provider,
    aws_lambda_function.lambdas["providerCreateRecord"],
    aws_lambda_function.lambdas["providerGetRecordById"],
    aws_lambda_function.lambdas["providerUpdateRecordById"],
    aws_lambda_function.lambdas["providerDeleteRecordById"],
    aws_lambda_function.lambdas["providerSealRecordById"],
    aws_lambda_function.lambdas["providerUploadImageForRecordBy"],
    aws_lambda_function.lambdas["providerGetImageByFormTag"],
    aws_lambda_function.lambdas["providerDeleteImageByFormTag"],
    aws_lambda_function.lambdas["providerGetOwnRecords"],
    aws_lambda_function.lambdas["providerGetFormsByCountry"],
    aws_lambda_function.lambdas["providerGetFormByUUID"],
    aws_lambda_function.lambdas["providerPutSharedRecordById"],
    aws_lambda_function.lambdas["providerGetRecordSharesById"],
    aws_lambda_function.lambdas["providerGetSharedRecordById"],
    aws_lambda_function.lambdas["providerDeleteSharedRecordById"],
    aws_lambda_function.lambdas["providerGetSharedRecordImageByFormTag"],
    aws_lambda_function.lambdas["providerGetSharedRecordsByUser"],
    aws_lambda_function.lambdas["providerGetSharedRecordsWithUser"]
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
    aws_lambda_function.lambdas["providerCreateRecord"],
    aws_lambda_function.lambdas["providerGetRecordById"],
    aws_lambda_function.lambdas["providerUpdateRecordById"],
    aws_lambda_function.lambdas["providerDeleteRecordById"],
    aws_lambda_function.lambdas["providerSealRecordById"],
    aws_lambda_function.lambdas["providerUploadImageForRecordBy"],
    aws_lambda_function.lambdas["providerGetImageByFormTag"],
    aws_lambda_function.lambdas["providerDeleteImageByFormTag"],
    aws_lambda_function.lambdas["providerGetOwnRecords"],
    aws_lambda_function.lambdas["providerGetFormsByCountry"],
    aws_lambda_function.lambdas["providerGetFormByUUID"],
    aws_lambda_function.lambdas["providerPutSharedRecordById"],
    aws_lambda_function.lambdas["providerGetRecordSharesById"],
    aws_lambda_function.lambdas["providerGetSharedRecordById"],
    aws_lambda_function.lambdas["providerDeleteSharedRecordById"],
    aws_lambda_function.lambdas["providerGetSharedRecordImageByFormTag"],
    aws_lambda_function.lambdas["providerGetSharedRecordsByUser"],
    aws_lambda_function.lambdas["providerGetSharedRecordsWithUser"]
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

resource "aws_sqs_queue" "dead_letter_queue" {
  name = "${var.stage}-${var.namespace}-api-${var.user_type}-dlq"
  #checkov:skip=CKV_AWS_27:We enabled server-side encryption, checkov only looks for CMK instead of SSE
  sqs_managed_sse_enabled = true
}

resource "aws_api_gateway_account" "api" {
  cloudwatch_role_arn = aws_iam_role.cloudwatch.arn
}
