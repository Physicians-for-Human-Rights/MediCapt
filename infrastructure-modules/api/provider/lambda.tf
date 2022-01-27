locals {
  lambdas = {
    providerCreateRecord = {
      path = "record:post"
    }
    providerGetRecordById = {
      path = "record@{recordId}:get"
    }
    providerUpdateRecordById = {
      path = "record@{recordId}:post"
    }
    providerDeleteRecordById = {
      path = "record@{recordId}:delete"
    }
    providerSealRecordById = {
      path = "seal_record@{recordId}:post"
    }
    providerUploadImageForRecordBy = {
      path = "record_image@{recordId}:post"
    }
    providerGetImageByFormTag = {
      path = "record_image@{recordId}@{formTag}:get"
    }
    providerDeleteImageByFormTag = {
      path = "record_image@{recordId}@{formTag}:delete"
    }
    providerGetOwnRecords = {
      path = "own_records:get"
    }
    providerGetFormsByCountry = {
      path = "forms@country@{country}:get"
    }
    providerGetFormByUUID = {
      path = "form@{form_uuid}:get"
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
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name                  = "${var.namespace}-${var.stage}-${each.key}"
  filename                       = data.archive_file.srcs[each.key].output_path
  source_code_hash               = data.archive_file.srcs[each.key].output_base64sha256
  handler                        = "index.handler"
  runtime                        = "nodejs14.x"
  role                           = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigws" {
  for_each = aws_lambda_function.lambdas
  #
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
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
