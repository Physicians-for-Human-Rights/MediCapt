locals {
  stage               = "dev"
  domain_name         = "medicapt.click"
  hosted_zone_id      = "Z01049462WS08OA7H5COV"
  namespace           = "${get_env("TG_STATE_PREFIX", "")}medicapt"
  # TODO Change this
  user_reply_to_email = "andrei@0xab.com"
  base_source_url     = "${get_parent_terragrunt_dir()}/../../medicapt-infrastructure-modules//"
  account_id          = "926951938632"
  # TODO Cognito update for prod
  temporary_password_validity_days = 10
  budget_slack_webhook = "https://hooks.slack.com/services/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"
  support_role_arns    = ["arn:aws:iam::926951938632:user/medicapt-shared"]
  # Update this periodically
  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-extension-versionsx86-64.html
  lambda_insights_layer = "arn:aws:lambda:us-east-1:580247275435:layer:LambdaInsightsExtension:16"
  # A map like
  # { "arn" = [""] }
  # fill principal ARNs which will be graned permissions to bucket prefixes (without /)
  records_bucket_privileged_principal_arns = {
    "arn:aws:iam::926951938632:user/medicapt-shared" = [""]
    "arn:aws:iam::926951938632:root" = [""]
  }
  # Window in which Max is 30, set it to that in prod
  records_bucket_kms_deletion_window_in_days = 7
}
