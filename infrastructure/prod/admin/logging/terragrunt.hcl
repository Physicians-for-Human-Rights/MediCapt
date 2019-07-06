terraform {
  source = "../../../../modules/admin/logging/"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

inputs = {
}
