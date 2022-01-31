terraform {
  source = "${local.stage_vars.locals.base_source_url}//api/associate/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

dependency "cognito" {
  config_path = "../../admin/users/associate"
}

dependency "website" {
  config_path = "../../networking/website"
}

inputs = {
  cognito_user_pool_associate_arn = dependency.cognito.outputs.cognito_user_pool_arn
  domain_name = dependency.website.outputs.domain_name
  certificate_arn = dependency.website.outputs.acm_arn
  endpoint_configuration = "REGIONAL"
  hosted_zone_id = dependency.website.outputs.hosted_zone_id
  user_type = "associate"
}
