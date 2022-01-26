resource "aws_lambda_function" "providerCreateRecord" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerCreateRecord"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerCreateRecord" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerCreateRecord.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerGetRecordById" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerGetRecordById"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerGetRecordById" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerGetRecordById.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerUpdateRecordById" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerUpdateRecordById"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerUpdateRecordById" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerUpdateRecordById.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerDeleteRecordById" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerDeleteRecordById"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerDeleteRecordById" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerDeleteRecordById.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerSealRecordById" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerSealRecordById"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerSealRecordById" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerSealRecordById.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerUploadImageForRecordBy" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerUploadImageForRecordBy"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerUploadImageForRecordBy" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerUploadImageForRecordBy.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerGetImageByFormTag" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerGetImageByFormTag"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerGetImageByFormTag" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerGetImageByFormTag.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerDeleteImageByFormTag" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerDeleteImageByFormTag"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerDeleteImageByFormTag" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerDeleteImageByFormTag.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerGetOwnRecords" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerGetOwnRecords"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerGetOwnRecords" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerGetOwnRecords.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerGetFormsByCountry" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerGetFormsByCountry"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerGetFormsByCountry" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerGetFormsByCountry.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}

resource "aws_lambda_function" "providerGetFormByUUID" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerGetFormByUUID"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = null
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerGetFormByUUID" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.providerGetFormByUUID.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${replace(aws_api_gateway_deployment.api.execution_arn, var.stage, "")}*/*"
}
