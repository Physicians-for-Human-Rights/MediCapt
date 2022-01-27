locals {
  lambdas = {
    providerCreateRecord = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerGetRecordById = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerUpdateRecordById = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerDeleteRecordById = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerSealRecordById = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerUploadImageForRecordBy = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerGetImageByFormTag = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerDeleteImageByFormTag = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerGetOwnRecords = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerGetFormsByCountry = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }

    providerGetFormByUUID = {
      filename = data.archive_file.src.output_path
      source_code_hash = data.archive_file.src.output_base64sha256
    }
  }
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
  filename                       = each.value.filename
  source_code_hash               = each.value.source_code_hash
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
