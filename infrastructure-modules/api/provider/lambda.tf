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
  reserved_concurrent_executions = 0
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
  reserved_concurrent_executions = 0
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerGetRecordById" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.providerGetRecordById.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
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
  reserved_concurrent_executions = 0
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerUpdateRecordById" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.providerUpdateRecordById.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
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
  reserved_concurrent_executions = 0
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerDeleteRecordById" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.providerDeleteRecordById.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
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
  reserved_concurrent_executions = 0
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerSealRecordById" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.providerSealRecordById.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
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
  reserved_concurrent_executions = 0
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerUploadImageForRecordBy" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.providerUploadImageForRecordBy.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
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
  reserved_concurrent_executions = 0
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerGetImageByFormTag" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.providerGetImageByFormTag.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
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
  reserved_concurrent_executions = 0
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerDeleteImageByFormTag" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.providerDeleteImageByFormTag.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
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
  reserved_concurrent_executions = 0
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerGetOwnRecords" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.providerGetOwnRecords.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
}

resource "aws_lambda_function" "providerGetForms" {
  depends_on = [
    aws_iam_role_policy_attachment.dead_letter,
    aws_iam_role_policy_attachment.aws_xray_write_only_access,
    aws_iam_role_policy_attachment.cloudwatch_lambda
  ]
  function_name = "${var.namespace}-${var.stage}-providerGetForms"
  filename = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  handler = "index.handler"
  runtime = "nodejs14.x"
  role = aws_iam_role.gateway_lambda.arn
  reserved_concurrent_executions = 0
  tracing_config {
    mode = "Active"
  }
  dead_letter_config {
    target_arn = aws_sqs_queue.dead_letter_queue.arn
  }
}

resource "aws_lambda_permission" "apigw-providerGetForms" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.providerGetForms.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.api.execution_arn}/*/*"
}
