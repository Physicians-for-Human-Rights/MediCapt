terraform {
  source = "${local.stage_vars.locals.base_source_url}//storage/records/metadata/"
}

include "root" {
  path = find_in_parent_folders()
}

dependency "cognito" {
  config_path = "../../../admin/users/provider"
}

inputs = {
  cognito_identity_pool = dependency.cognito.outputs.cognito_identity_pool
}


locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}
