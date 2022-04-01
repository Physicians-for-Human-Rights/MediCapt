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

inputs = {
  cognito_user_pool_manager_arn = dependency.cognito.outputs.cognito_user_pool_arn
  domain_name = dependency.website.outputs.domain_name
  certificate_arn = dependency.website.outputs.acm_arn
  endpoint_configuration = "REGIONAL"
  hosted_zone_id = dependency.website.outputs.hosted_zone_id
  lambda_layer_modules = dependency.lambda_layer_modules.outputs.arn
  lambda_layer_internal = dependency.lambda_layer_internal.outputs.arn
  humanid_lambda = dependency.humanid.outputs.lambda.function_name
  humanid_lambda_arn = dependency.humanid.outputs.lambda.arn
  location_table = dependency.locations.outputs.dynamodb.table_name
  location_table_arn = dependency.locations.outputs.dynamodb.table_arn
  user_type = "manager"
}
