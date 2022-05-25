terraform {
  source = "${local.stage_vars.locals.base_source_url}//admin/users/"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  stage_vars = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
}

inputs = {
  user_type = "manager"
  #
  cognito_default_users = {}
  #
  # TODO We would like to require MFA
  # But amplify on Android has an issue with it
  mfa_configuration = "OPTIONAL"
  #
  # TODO We would like to upgrade this to ENFORCED but aren't sure about the
  # real-world impact on users yet.
  # AWS recommends starting with audit and elevating only after allowing
  # the system to adapt and after verying its actions.
  advanced_security_mode = "AUDIT" # "ENFORCED"
  #
  invite_email_subject = "Invitation to MediCapt as a manager"
  invite_email_message = <<EOF
Welcome to MediCapt!

Your username is {username} and your temporary password is {####}

Thank you!
Medicapt team
EOF
  invite_sms_message   = <<EOF
Welcome to MediCapt!

Your username is {username} and your temporary password is {####}

Thank you!
Medicapt team
EOF
  # User attributes
  user_attributes = [
    {
      type     = "String"
      name     = "email"
      required = true
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "birthdate"
      required = true
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "name"
      required = true
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "nickname"
      required = true
      mutable  = true
      min_length = 1
      max_length = 300
    },
    {
      type     = "String"
      name     = "formal_name"
      required = true
      mutable  = true
      min_length = 1
      max_length = 300
    },
    {
      type     = "String"
      name     = "gender"
      required = true
      mutable  = true
      min_length = 1
      max_length = 300
    },
    {
      type     = "String"
      name     = "phone_number"
      required = false
      mutable  = true
      min_length = 3
      max_length = 300
    },
    # Custom attributes cannot be required
    {
      type     = "String"
      name     = "official_id_type"
      required = false
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "official_id_code"
      required = false
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "official_id_expires"
      required = false
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "official_id_image"
      required = false
      mutable  = true
      min_length = 3
      max_length = 300
    },
    {
      type     = "String"
      name     = "country"
      required = false
      mutable  = true
      min_length = 1
      max_length = 100
    },
    {
      type     = "String"
      name     = "language"
      required = false
      mutable  = true
      min_length = 1
      max_length = 100
    },
    {
      type     = "String"
      # This date is stored as ISO 8601
      name     = "expiry_date"
      required = false
      mutable  = true
      min_length = 1
      max_length = 100
    },
    {
      type     = "String"
      name     = "storage_version"
      required = false
      mutable  = true
      min_length = 1
      max_length = 100
    },
    {
      # This is a comma separated list of location UUIDs where the account has permissions
      type     = "String"
      name     = "allowed_locations"
      required = false
      mutable  = true
      min_length = 0
      max_length = 2048
    },
    {
      type     = "String"
      name     = "created_by"
      required = false
      mutable  = true
      min_length = 0
      max_length = 2048
    },
    {
      type     = "String"
      name     = "updated_by"
      required = false
      mutable  = true
      min_length = 0
      max_length = 2048
    },
    {
      type     = "String"
      name     = "human_id"
      required = false
      mutable  = true
      min_length = 0
      max_length = 2048
    }
  ]
}
