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
    { cognito_user_pool_id = "${var.namespace}-${var.stage}-provider"
      region = var.aws_region
      account_id = data.aws_caller_identity.current.account_id
      lambda_uri = aws_lambda_function.gateway_lambda.invoke_arn
    })
}

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = "${aws_api_gateway_rest_api.records.id}"
  stage_name  = "${var.stage}"
}

resource "aws_lambda_permission" "apigw" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.gateway_lambda.arn}"
  principal     = "apigateway.amazonaws.com"
  # The /*/* portion grants access from any method on any resource within the API Gateway "REST API"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
}

resource "aws_lambda_function" "gateway_lambda" {
  function_name = "${var.namespace}-${var.stage}-provider-lambda"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
}

resource "aws_iam_role" "gateway_lambda" {
  name  = "${var.namespace}_lambda_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["sts:AssumeRole"],
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

output "aws_api_gateway_rest_api_records" {
  value = aws_api_gateway_rest_api.records
  description = "The records gateway"
}

output "aws_api_gateway_deployment_api" {
  value = aws_api_gateway_deployment.api
  description = "The records gateway deployment"
}
