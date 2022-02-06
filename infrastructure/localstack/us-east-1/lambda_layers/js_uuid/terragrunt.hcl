terraform {
  source = "${local.stage_vars.locals.base_source_url}//lambda_layers/js_uuid/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

inputs = {
}
