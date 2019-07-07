terraform {
  source = "../../../../medicapt-infrastructure-modules//api/records"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

inputs = {
}
