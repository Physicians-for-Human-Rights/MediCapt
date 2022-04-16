terraform {
  source = "${local.stage_vars.locals.base_source_url}//api/manager/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

dependency "cognito" {
  config_path = "../../admin/users/manager"
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

inputs = {
  cognito_user_pool_manager_arn = dependency.cognito.outputs.cognito_user_pool_arn
  domain_name = dependency.website.outputs.domain_name
  certificate_arn = dependency.website.outputs.acm_arn
  endpoint_configuration = "REGIONAL"
  hosted_zone_id = dependency.website.outputs.hosted_zone_id
  user_type = "manager"
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
}
