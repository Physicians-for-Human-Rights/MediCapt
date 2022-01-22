terraform {
  required_version = ">= 1.1, < 1.2"
}

data "archive_file" "src" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/src.zip"
}

data "aws_caller_identity" "current" {}

resource "aws_api_gateway_rest_api" "records" {
  name        = "${var.namespace}-${var.stage}-records"
  description = "Records API"
  body = templatefile("${path.module}/api.yaml",
    { cognito_user_pool_provider_arn = var.cognito_user_pool_provider_arn
      region = var.aws_region
      account_id = data.aws_caller_identity.current.account_id
      lambda_uri_providerCreateRecord           = aws_lambda_function.providerCreateRecord.invoke_arn
      lambda_uri_providerGetRecordById          = aws_lambda_function.providerGetRecordById.invoke_arn
      lambda_uri_providerUpdateRecordById       = aws_lambda_function.providerUpdateRecordById.invoke_arn
      lambda_uri_providerDeleteRecordById       = aws_lambda_function.providerDeleteRecordById.invoke_arn
      lambda_uri_providerSealRecordById         = aws_lambda_function.providerSealRecordById.invoke_arn
      lambda_uri_providerUploadImageForRecordBy = aws_lambda_function.providerUploadImageForRecordBy.invoke_arn
      lambda_uri_providerGetImageByFormTag      = aws_lambda_function.providerGetImageByFormTag.invoke_arn
      lambda_uri_providerDeleteImageByFormTag   = aws_lambda_function.providerDeleteImageByFormTag.invoke_arn
      lambda_uri_providerGetOwnRecords          = aws_lambda_function.providerGetOwnRecords.invoke_arn
      lambda_uri_providerGetForms               = aws_lambda_function.providerGetForms.invoke_arn
    })
}

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.records.id
  # should be var.stage but see this issue, required for cloudwatch support
  # the stage itself is set up by aws_api_gateway_stage
  # https://github.com/hashicorp/terraform-provider-aws/issues/1153
  stage_name  = ""
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "api" {
  depends_on = [
    aws_api_gateway_deployment.api
  ]
  rest_api_id    = aws_api_gateway_rest_api.records.id
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
    aws_api_gateway_account.provider
  ]
  rest_api_id = aws_api_gateway_rest_api.records.id
  stage_name  = var.stage
  method_path = "*/*"
  settings {
    metrics_enabled = true
    logging_level = "INFO"
    data_trace_enabled = true
  }
}

resource "aws_lambda_permission" "apigw" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerCreateRecord.function_name
  principal     = "apigateway.amazonaws.com"
  # The /*/* portion grants access from any method on any resource within the API Gateway "REST API"
  # This used to be
  # source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
  # But we must change the arn a bit
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_sqs_queue" "dead_letter_queue" {
  name = "${var.namespace}-${var.stage}-provider-dlq"
  #checkov:skip=CKV_AWS_27:We enabled server-side encryption, checkov only looks for CMK instead of SSE
  sqs_managed_sse_enabled = true
}

resource "aws_api_gateway_account" "provider" {
  cloudwatch_role_arn = aws_iam_role.cloudwatch.arn
}
