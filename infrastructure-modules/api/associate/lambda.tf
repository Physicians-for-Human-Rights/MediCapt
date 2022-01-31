locals {
  lambdas = {
    associateGetSharedRecordById = {
      path = "share@record@byId@{shareId}/get"
      reserved_concurrent_executions = null
    }
    associateDeleteSharedRecordById = {
      path = "share@record@byId@{shareId}/delete"
      reserved_concurrent_executions = null
    }
    associateGetSharedRecordImageByFormTag = {
      path = "share@record@image@byId@{shareId}@{formTag}/get"
      reserved_concurrent_executions = null
    }
    associateGetSharedRecordsWithUser = {
      path = "share@with-user/get"
      reserved_concurrent_executions = null
    }
  }
}

data "archive_file" "srcs" {
  for_each = local.lambdas
  #
  type        = "zip"
  source_dir  = "${path.module}/apis/${each.value.path}/src"
  output_path = "${path.module}/apis/${each.value.path}/src.zip"
}

resource "aws_lambda_function" "lambdas" {
  for_each = local.lambdas
  #
  function_name                  = "${var.stage}-${var.namespace}-api-${each.key}"
  filename                       = data.archive_file.srcs[each.key].output_path
  source_code_hash               = data.archive_file.srcs[each.key].output_base64sha256
  handler                        = "index.handler"
  runtime                        = "nodejs14.x"
  role                           = aws_iam_role.lambdas[each.key].arn
  reserved_concurrent_executions = each.value.reserved_concurrent_executions
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
  environment {
    variables = {
      # NB In a better world we would do:
      # depends_on = [
      #   aws_iam_role_policy_attachment.dead_letter[each.key],
      #   aws_iam_role_policy_attachment.aws_xray_write_only_access[each.key],
      #   aws_iam_role_policy_attachment.cloudwatch_lambda[each.key]
      # ]
      # But as of 2022 Terraform doesn't allow any references in depends_on
      # they must be totally static. So we cheat and introduce this manual dependency
      dependencies = sha256(join(",",
        [ aws_iam_role_policy_attachment.dead_letter[each.key].policy_arn,
          aws_iam_role_policy_attachment.aws_xray_write_only_access[each.key].policy_arn,
          aws_iam_role_policy_attachment.cloudwatch_lambda[each.key].policy_arn,
          aws_iam_role_policy_attachment.insights_policy[each.key].policy_arn
        ]))
    }
  }
  layers = [
    var.lambda_insights_layer
  ]
  # TODO Determine what memory size works best per endpoint
  # https://github.com/alexcasalboni/aws-lambda-power-tuning
  memory_size = 128
  # TODO We could transition to architectures=["arm64"], worth benchmarking
}

resource "aws_lambda_permission" "apigws" {
  for_each = aws_lambda_function.lambdas
  #
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

data "template_file" "lambda_policy_jsons" {
  for_each = local.lambdas
  #
  template = file("${path.module}/apis/${each.value.path}/policy.json")
  vars = {
  }
}

resource "aws_iam_role" "lambdas" {
  for_each = local.lambdas
  #
  name  = "${var.namespace}-${var.stage}-lambda-role-${each.key}"
  assume_role_policy = data.template_file.lambda_policy_jsons[each.key].rendered
}

resource "aws_iam_role_policy_attachment" "dead_letter" {
  for_each = local.lambdas
  #
  role       = aws_iam_role.lambdas[each.key].name
  policy_arn = aws_iam_policy.dead_letter.arn
}

resource "aws_iam_role_policy_attachment" "aws_xray_write_only_access" {
  for_each = local.lambdas
  #
  role       = aws_iam_role.lambdas[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_lambda" {
  for_each = local.lambdas
  #
  role       = aws_iam_role.lambdas[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_iam_role_policy_attachment" "insights_policy" {
  for_each = local.lambdas
  #
  role       = aws_iam_role.lambdas[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"
}

locals {
  lambdaARNs = {for name, value in local.lambdas:
    name => aws_lambda_function.lambdas[name]
  }
}

locals {
  aws_lambda_functions = [for name, value in local.lambdas:
    aws_lambda_function.lambdas[name]
  ]
}
