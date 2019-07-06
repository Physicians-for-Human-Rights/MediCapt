terraform {
  source = "../../../../../modules/storage/db/"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

inputs = {
  backend = "deidentified"
}
