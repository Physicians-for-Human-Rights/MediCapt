terraform {
  source = "git::ssh://git@github.com/abarbu/medicapt-infrastructure-modules.git//networking/vpc?ref=master"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

inputs = {
  backend = "metadata"
  classB = 2
  flow_logs_traffic_type = "ALL"
  flow_logs_retention_in_days = 14
}
