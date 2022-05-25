terraform {
  source = "${local.stage_vars.locals.base_source_url}//email/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

dependency "website" {
  config_path = "../networking/website"
}

inputs = {
  hosted_zone_id = dependency.website.outputs.hosted_zone_id
  domain_name  = dependency.website.outputs.domain_name
}
