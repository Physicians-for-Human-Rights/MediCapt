terraform {
  source = "${local.stage_vars.locals.base_source_url}//storage/records/sharing/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

dependency "provider_cognito" {
  config_path = "../../../admin/users/provider"
}

dependency "associate_cognito" {
  config_path = "../../../admin/users/associate"
}

inputs = {
  cognito_identity_provider_aud = dependency.provider_cognito.outputs.cognito_identity_pool.id
  cognito_identity_associate_aud = dependency.associate_cognito.outputs.cognito_identity_pool.id
}
