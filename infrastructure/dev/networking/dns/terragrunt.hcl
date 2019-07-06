terraform {
  source = "git::ssh://git@github.com/abarbu/medicapt-infrastructure-modules.git//networking/dns?ref=master"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

inputs = {
}
