terraform {
  source = "../../../../modules/admin/users-providers/"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

inputs = {
}
