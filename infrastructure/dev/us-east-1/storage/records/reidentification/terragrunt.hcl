terraform {
  source = "${local.stage_vars.locals.base_source_url}//storage/records/reidentification/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

dependency "full" {
  config_path = "../full"
}

dependency "lambda_layer_modules" {
  config_path = "../../../lambda_layers/common_js_modules"
}

dependency "lambda_layer_internal" {
  config_path = "../../../lambda_layers/common_js_internal"
}

inputs = {
  records_bucket_id = dependency.full.outputs.records_s3_bucket_id
  records_bucket_arn = dependency.full.outputs.records_s3_bucket_arn
  lambda_layer_modules = dependency.lambda_layer_modules.outputs.arn
  lambda_layer_internal = dependency.lambda_layer_internal.outputs.arn
}
