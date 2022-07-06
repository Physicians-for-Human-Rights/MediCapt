terraform {
  source = "${local.stage_vars.locals.base_source_url}//api/provider/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

dependency "cognito" {
  config_path = "../../admin/users/provider"
}

dependency "website" {
  config_path = "../../networking/website"
}

dependency "lambda_layer_modules" {
  config_path = "../../lambda_layers/common_js_modules"
}

dependency "lambda_layer_internal" {
  config_path = "../../lambda_layers/common_js_internal"
}

dependency "humanid" {
  config_path = "../../service/humanid"
}

dependency "locations" {
  config_path = "../../storage/locations"
}

dependency "forms" {
  config_path = "../../storage/forms"
}

dependency "users_associate" {
  config_path = "../../admin/users/associate"
}

dependency "users_formdesigner" {
  config_path = "../../admin/users/formdesigner"
}

dependency "users_manager" {
  config_path = "../../admin/users/manager"
}

dependency "users_provider" {
  config_path = "../../admin/users/provider"
}

dependency "users_researcher" {
  config_path = "../../admin/users/researcher"
}

dependency "records_full" {
  config_path = "../../storage/records/full"
}

dependency "records_metadata" {
  config_path = "../../storage/records/metadata"
}

dependency "sharing" {
  config_path = "../../storage/records/sharing"
}

inputs = {
  cognito_user_pool_provider_arn = dependency.cognito.outputs.cognito_user_pool_arn
  domain_name = dependency.website.outputs.domain_name
  certificate_arn = dependency.website.outputs.acm_arn
  endpoint_configuration = "REGIONAL"
  hosted_zone_id = dependency.website.outputs.hosted_zone_id
  user_type = "provider"
  #
  lambda_layer_modules = dependency.lambda_layer_modules.outputs.arn
  lambda_layer_internal = dependency.lambda_layer_internal.outputs.arn
  #
  humanid_lambda = dependency.humanid.outputs.lambda.function_name
  humanid_lambda_arn = dependency.humanid.outputs.lambda.arn
  #
  location_dynamodb = dependency.locations.outputs.dynamodb
  #
  user_pool_provider = dependency.users_provider.outputs.cognito_user_pool_id
  user_pool_associate = dependency.users_associate.outputs.cognito_user_pool_id
  user_pool_manager = dependency.users_manager.outputs.cognito_user_pool_id
  user_pool_formdesigner = dependency.users_formdesigner.outputs.cognito_user_pool_id
  user_pool_researcher = dependency.users_researcher.outputs.cognito_user_pool_id
  #
  user_pool_provider_arn = dependency.users_provider.outputs.cognito_user_pool_arn
  user_pool_associate_arn = dependency.users_associate.outputs.cognito_user_pool_arn
  user_pool_manager_arn = dependency.users_manager.outputs.cognito_user_pool_arn
  user_pool_formdesigner_arn = dependency.users_formdesigner.outputs.cognito_user_pool_arn
  user_pool_researcher_arn = dependency.users_researcher.outputs.cognito_user_pool_arn
  #
  image_bucket_provider = dependency.users_provider.outputs.image_bucket_id
  image_bucket_associate = dependency.users_associate.outputs.image_bucket_id
  image_bucket_manager = dependency.users_manager.outputs.image_bucket_id
  image_bucket_formdesigner = dependency.users_formdesigner.outputs.image_bucket_id
  image_bucket_researcher = dependency.users_researcher.outputs.image_bucket_id
  #
  image_bucket_provider_arn = dependency.users_provider.outputs.image_bucket_arn
  image_bucket_associate_arn = dependency.users_associate.outputs.image_bucket_arn
  image_bucket_manager_arn = dependency.users_manager.outputs.image_bucket_arn
  image_bucket_formdesigner_arn = dependency.users_formdesigner.outputs.image_bucket_arn
  image_bucket_researcher_arn = dependency.users_researcher.outputs.image_bucket_arn
  #
  form_dynamodb = dependency.forms.outputs.dynamodb
  form_table = dependency.forms.outputs.forms_dynamodb_table.table_name
  form_table_arn = dependency.forms.outputs.forms_dynamodb_table.table_arn
  form_bucket = dependency.forms.outputs.forms_s3_bucket.bucket
  form_bucket_arn = dependency.forms.outputs.forms_s3_bucket.arn
  #
  record_dynamodb = dependency.records_metadata.outputs.records_dynamodb
  record_table = dependency.records_metadata.outputs.records_dynamodb.table_name
  record_table_arn = dependency.records_metadata.outputs.records_dynamodb.table_arn
  record_table_kms = dependency.records_metadata.outputs.records_dynamodb_kms
  record_bucket = dependency.records_full.outputs.records_s3_bucket.bucket_id
  record_bucket_arn = dependency.records_full.outputs.records_s3_bucket.bucket_arn
  record_bucket_kms = dependency.records_full.outputs.records_s3_bucket_kms
  #
  sharing_dynamodb = dependency.sharing.outputs.sharing_dynamodb
  sharing_table = dependency.sharing.outputs.sharing_dynamodb.table_name
  sharing_table_arn = dependency.sharing.outputs.sharing_dynamodb.table_arn
  sharing_table_kms = dependency.sharing.outputs.sharing_dynamodb_kms
}
