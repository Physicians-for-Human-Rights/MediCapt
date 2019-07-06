terraform {
  source = "../../../../../modules/networking/vpc/"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

inputs = {
  backend = "records"
  classB = 1
  flow_logs_traffic_type = "ALL"
  flow_logs_retention_in_days = 14
}
