terraform {
  source = "${local.stage_vars.locals.base_source_url}//storage/records/metadata/"
}

include "root" {
  path = find_in_parent_folders()
}

inputs = {
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}
