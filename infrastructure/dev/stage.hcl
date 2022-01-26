locals {
  stage               = "dev"
  domain_name         = "medicapt.click"
  hosted_zone_id      = "Z01049462WS08OA7H5COV"
  namespace           = "${get_env("TG_STATE_PREFIX", "")}medicapt"
  # TODO Change this
  user_reply_to_email = "andrei@0xab.com"
  base_source_url     = "${get_parent_terragrunt_dir()}/../../medicapt-infrastructure-modules//"
  account_id          = "926951938632"
  # cognito
  temporary_password_validity_days = 10
  cognito_default_users = {
    andrei = "andrei@0xab.com"
  }
  budget_slack_webhook = "https://hooks.slack.com/services/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"
}
