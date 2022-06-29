locals {
  lambdas = {
    formdesignerCreateForm = {
      path = "form/post"
      reserved_concurrent_executions = null
    }
    formdesignerGetForms = {
      path = "form/get"
      reserved_concurrent_executions = null
    }
    formdesignerGetFormById = {
      path = "form@byId@{formId}/get"
      reserved_concurrent_executions = null
    }
    formdesignerGetFormByIdAndVersion = {
      path = "form@byId@{formId}@{formVersion}/get"
      reserved_concurrent_executions = null
    }
    formdesignerUpdateFormById = {
      path = "form@byId@{formId}/post"
      reserved_concurrent_executions = null
    }
    formdesignerGetFormMetadataById = {
      path = "form@metadataById@{formId}/get"
      reserved_concurrent_executions = null
    }
    formdesignerCommitFormById = {
      path = "form@commitById@{formId}/post"
      reserved_concurrent_executions = null
    }
    formdesignerGetUserById = {
      path = "user@byId@{poolId}@{username}/get"
      reserved_concurrent_executions = null
    }
    formdesignerGetLocationById = {
      path = "location@byId@{locationId}/get"
      reserved_concurrent_executions = null
    }
  }
}

data "archive_file" "srcs" {
  for_each = local.lambdas
  #
  type        = "zip"
  source_dir  = "../../dist-lambda/api/formdesigner/apis/${each.value.path}/src/"
  output_path = "${path.module}/api/formdesigner/apis/${each.value.path}/src.zip"
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
      location_table = var.location_dynamodb.table_name
      location_gsi_id  = var.location_dynamodb.global_secondary_index_names[0]
      location_gsi_date = var.location_dynamodb.global_secondary_index_names[1]
      location_gsi_language = var.location_dynamodb.global_secondary_index_names[2]
      location_gsi_country = var.location_dynamodb.global_secondary_index_names[3]
      location_gsi_entity = var.location_dynamodb.global_secondary_index_names[4]
      user_pool_provider = var.user_pool_provider
      user_pool_associate = var.user_pool_associate
      user_pool_manager = var.user_pool_manager
      user_pool_formdesigner = var.user_pool_formdesigner
      user_pool_researcher = var.user_pool_researcher
      image_bucket_provider = var.image_bucket_provider
      image_bucket_associate = var.image_bucket_associate
      image_bucket_manager = var.image_bucket_manager
      image_bucket_formdesigner = var.image_bucket_formdesigner
      image_bucket_researcher = var.image_bucket_researcher
      form_table = var.form_table
      form_table_arn = var.form_table_arn
      form_bucket = var.form_bucket
      form_gsi_id  = var.form_dynamodb.global_secondary_index_names[0]
      form_gsi_date = var.form_dynamodb.global_secondary_index_names[1]
      form_gsi_language = var.form_dynamodb.global_secondary_index_names[2]
      form_gsi_country = var.form_dynamodb.global_secondary_index_names[3]
      form_gsi_location = var.form_dynamodb.global_secondary_index_names[4]
      # NB In a better world we would do:
      # depends_on = [
      #   aws_iam_role_policy_attachment.dead_letter[each.key],
      #   aws_iam_role_policy_attachment.aws_xray_write_only_access[each.key],
      #   aws_iam_role_policy_attachment.cloudwatch_lambda[each.key]
      # ]
      # But as of 2022 Terraform doesn't allow any references in depends_on
      # they must be totally static. So we cheat and introduce this manual dependency
      dependencies = sha256(join(",",
        [ # aws_iam_role_policy_attachment.dead_letter[each.key].policy_arn,
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

data "aws_kms_key" "bucket" {
  key_id = "alias/aws/s3"
}

resource "aws_iam_role_policy" "per_lambda_json_policy" {
  for_each = local.lambdas
  #
  name   = "${var.namespace}-${var.stage}-lambda-${each.key}-json"
  role   = aws_iam_role.lambdas[each.key].name
  policy = templatefile("${path.module}/apis/${each.value.path}/policy.json",
    {
      humanid_lambda_arn = var.humanid_lambda_arn
      location_table_arn = var.location_dynamodb.table_arn
      user_pool_provider_arn = var.user_pool_provider_arn
      user_pool_associate_arn = var.user_pool_associate_arn
      user_pool_manager_arn = var.user_pool_manager_arn
      user_pool_formdesigner_arn = var.user_pool_formdesigner_arn
      user_pool_researcher_arn = var.user_pool_researcher_arn
      image_bucket_provider_arn = var.image_bucket_provider_arn
      image_bucket_associate_arn = var.image_bucket_associate_arn
      image_bucket_manager_arn = var.image_bucket_manager_arn
      image_bucket_formdesigner_arn = var.image_bucket_formdesigner_arn
      image_bucket_researcher_arn = var.image_bucket_researcher_arn
      image_kms_key_bucket_arn = data.aws_kms_key.bucket.arn
      form_table = var.form_table
      form_table_arn = var.form_table_arn
      form_bucket = var.form_bucket
      form_bucket_arn = var.form_bucket_arn
      form_kms_key_bucket_arn = data.aws_kms_key.bucket.arn
    })
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
