resource "aws_lambda_function" "add_reidentification" {
  depends_on = [
    # TODO Add this back, blocked by localstack
    # aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name                  = "${var.stage}-${var.namespace}-records-bucket-add-reidentification"
  filename                       = data.archive_file.srcs.output_path
  source_code_hash               = data.archive_file.srcs.output_base64sha256
  handler                        = "index.handler"
  runtime                        = "nodejs14.x"
  role                           = aws_iam_role.lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  # TODO Add this back, blocked by localstack
  # dead_letter_config {
  #   target_arn = aws_sqs_queue.dead_letter_queue.arn
  # }
  layers = [
    var.lambda_insights_layer,
    var.lambda_uuid_layer
  ]
  # TODO Determine what memory size works best per endpoint
  # https://github.com/alexcasalboni/aws-lambda-power-tuning
  memory_size = 128
  # TODO We could transition to architectures=["arm64"], worth benchmarking
  environment {
    variables = {
      reidentificationBucketId = module.s3_bucket.bucket_id
    }
  }
}

data "archive_file" "srcs" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/src.zip"
}

resource "aws_iam_role" "lambda" {
  name = "${var.stage}-${var.namespace}-s3-add-reidentification-lambda"
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

data "aws_kms_key" "bucket" {
  key_id = "alias/aws/s3"
}

data "aws_iam_policy_document" "s3_lambda" {
  statement {
    effect = "Allow"
    actions = [ "s3:PutObject" ]
    resources = [ "${module.s3_bucket.bucket_arn}/*" ]
  }
  statement {
    effect = "Allow"
    actions = [ "kms:GenerateDataKey" ]
    resources = [ data.aws_kms_key.bucket.arn ]
  }
  statement {
    effect = "Allow"
    actions = [ "s3:PutObjectTagging", "s3:PutObjectVersionTagging" ]
    resources = [ "${var.records_bucket_arn}/*" ]
  }
}

resource "aws_iam_policy" "s3_lambda" {
  name   = "${var.namespace}-${var.stage}-reidentification-s3-access"
  description = "Provide the reidentification lambda with s3 access"
  policy = data.aws_iam_policy_document.s3_lambda.json
}

resource "aws_iam_role_policy_attachment" "s3_lambda" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.s3_lambda.arn
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
