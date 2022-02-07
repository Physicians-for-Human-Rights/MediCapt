terraform {
  source = "${local.stage_vars.locals.base_source_url}//storage/humanid/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

dependency "lodash" {
  config_path = "../../lambda_layers/lodash/"
}

inputs = {
  lambda_lodash_layer = dependency.lodash.outputs.arn
}
