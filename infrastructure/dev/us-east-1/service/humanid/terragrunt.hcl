terraform {
  source = "${local.stage_vars.locals.base_source_url}//service/humanid/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

dependency "lambda_layer_modules" {
  config_path = "../../lambda_layers/common_js_modules"
}

inputs = {
  lambda_layer_modules = dependency.lambda_layer_modules.outputs.arn
}
