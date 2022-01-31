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

dependency "email" {
  config_path = "../../../email"
}

dependency "lambda_layers" {
  config_path = "../../../lambda_layers/js_uuid/"
}

inputs = {
  records_bucket_id = dependency.full.outputs.records_s3_bucket_id
  records_bucket_arn = dependency.full.outputs.records_s3_bucket_arn
  lambda_uuid_layer = dependency.lambda_layers.outputs.arn
}
