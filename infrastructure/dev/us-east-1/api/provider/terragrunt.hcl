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

inputs = {
  cognito_user_pool_provider_arn = dependency.cognito.outputs.cognito_user_pool_arn
}
