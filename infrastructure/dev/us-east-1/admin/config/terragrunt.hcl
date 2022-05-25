terraform {
  source = "${local.stage_vars.locals.base_source_url}//admin/config/"
}

include "root" {
  path = find_in_parent_folders()
}

dependency "cloudtrail" {
  config_path = "../cloudtrail"
}

inputs = {
  cloudtrail_bucket_name = dependency.cloudtrail.outputs.cloudtrail_bucket_name
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}
