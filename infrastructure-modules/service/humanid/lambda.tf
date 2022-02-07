resource "aws_lambda_function" "humanid" {
  depends_on = [
    # aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name                  = "${var.stage}-${var.namespace}-humanid"
  filename                       = data.archive_file.srcs.output_path
  source_code_hash               = data.archive_file.srcs.output_base64sha256
  handler                        = "index.handler"
  runtime                        = "nodejs14.x"
  role                           = aws_iam_role.lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  # TODO Enable after localstack
  # dead_letter_config {
  #   target_arn = aws_sqs_queue.dead_letter_queue.arn
  # }
  layers = [
    var.lambda_insights_layer,
    var.lambda_lodash_layer
  ]
  # TODO Determine what memory size works best per endpoint
  # https://github.com/alexcasalboni/aws-lambda-power-tuning
  memory_size = 128
  # TODO We could transition to architectures=["arm64"], worth benchmarking
  environment {
    variables = {
      humanid_table_name = module.dynamodb_table.table_name
    }
  }
}

data "archive_file" "srcs" {
  type        = "zip"
  source_dir  = "../../dist-lambda/storage/humanid/src/"
  output_path = "${path.module}/src/src.zip"
}

resource "aws_iam_role" "lambda" {
  name = "${var.stage}-${var.namespace}-humanid-lambda"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
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

data "aws_kms_key" "dynamo" {
  key_id = "alias/aws/dynamodb"
}

data "aws_iam_policy_document" "dynamodb_lambda" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:BatchWriteItem" ]
    resources = [ module.dynamodb_table.table_arn ]
  }
  statement {
    effect = "Allow"
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
    ]
    resources = [ data.aws_kms_key.dynamo.arn ]
  }
}

resource "aws_iam_policy" "dynamodb_lambda" {
  name   = "${var.namespace}-${var.stage}-humanid-dynamodb"
  description = "Provide the humanid lambdas with dynamodb access"
  policy = data.aws_iam_policy_document.dynamodb_lambda.json
}

resource "aws_iam_role_policy_attachment" "dynamodb_lambda" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.dynamodb_lambda.arn
}

resource "aws_iam_role_policy_attachment" "aws_xray_write_only_access" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_lambda" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_iam_role_policy_attachment" "insights_policy" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"
}

output "lambda" {
  value = aws_lambda_function.humanid
}
