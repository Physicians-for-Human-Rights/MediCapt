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
    associateGetSharedRecordImageByImageId = {
      path = "share@record@image@byId@{shareId}@{imageId}/get"
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
  source_dir  = "../../dist-lambda/api/associate/apis/${each.value.path}/src/"
  output_path = "${path.module}/api/associate/apis/${each.value.path}/src.zip"
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
  # TODO Reenable this, doesn't work in localstack
  # But what do we do with it?
  # dead_letter_config {
  #   target_arn = aws_sqs_queue.dead_letter_queue.arn
  # }
  environment {
    variables = {
      humanid_lambda = var.humanid_lambda
      location_table = var.location_table
      # NB In a better world we would do:
      # depends_on = [
      #   aws_iam_role_policy_attachment.dead_letter[each.key],
      #   aws_iam_role_policy_attachment.aws_xray_write_only_access[each.key],
      #   aws_iam_role_policy_attachment.cloudwatch_lambda[each.key]
      # ]
      # But as of 2022 Terraform doesn't allow any references in depends_on
      # they must be totally static. So we cheat and introduce this manual dependency
      dependencies = sha256(join(",",
        [ # TODO Reenable this, doesn't work in localstack
          # But what do we do with it?
          # aws_iam_role_policy_attachment.dead_letter[each.key].policy_arn,
          aws_iam_role_policy_attachment.aws_xray_write_only_access[each.key].policy_arn,
          aws_iam_role_policy_attachment.cloudwatch_lambda[each.key].policy_arn,
          aws_iam_role_policy_attachment.insights_policy[each.key].policy_arn
        ]))
      NODE_PATH = "./:/opt/nodejs/node8/:/opt/nodejs/node8/node_modules/:/opt/nodejs/:/opt/nodejs/node_modules:/opt/node_modules:/opt/:/opt/nodejs/lib:/opt/nodejs/node8/node_modules/:/opt/nodejs/node_modules:/var/runtime/node_modules:$LAMBDA_RUNTIME_DIR/node_modules"
    }
  }
  layers = [
    var.lambda_insights_layer,
    var.lambda_layer_modules,
    var.lambda_layer_internal
  ]
  # TODO Determine what memory size works best per endpoint
  # https://github.com/alexcasalboni/aws-lambda-power-tuning
  memory_size = 128
  # NB The very long timeout (10s) is to account for spinning up resources when
  # a lambda is invoked from a cold state. You are not meant to use these for
  # extended computations.
  timeout = 10
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

resource "aws_iam_role" "lambdas" {
  for_each = local.lambdas
  #
  name  = "${var.namespace}-${var.stage}-lambda-${each.key}"
  assume_role_policy = templatefile("${path.module}/apis/${each.value.path}/assume-policy.json", {})
}

resource "aws_iam_role_policy" "per_lambda_json_policy" {
  for_each = local.lambdas
  #
  name   = "${var.namespace}-${var.stage}-lambda-${each.key}-json"
  role   = aws_iam_role.lambdas[each.key].name
  policy = templatefile("${path.module}/apis/${each.value.path}/policy.json",
    {
      humanid_lambda_arn = var.humanid_lambda_arn
      location_table_arn = var.location_table_arn
    }
  )
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
