# Configure Terragrunt to automatically store tfstate files in an S3 bucket
remote_state {
  backend = "s3"
  config = {
    bucket         = "medicapt-terraform-state"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "medicapt-terraform-locks"
  }
}

# Configure root level variables that all resources can inherit. This is especially helpful with multi-account configs
# where terraform_remote_state data sources are placed directly into the modules.
inputs = {
  aws_region              = "us-east-1"
  stage                   = "prod"
  namespace               = "medicapt"
  cognito_sms_external_id = "2on4edbakldk3d9wjc"
  # TODO Change the url
  domain_name             = "learnmes.com"
  # TODO Change the reply email
  user_reply_to_email     = "andrei@0xab.com"
  
}

