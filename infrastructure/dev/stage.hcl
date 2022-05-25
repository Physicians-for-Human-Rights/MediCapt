locals {
  stage               = "dev"
  domain_name         = "medicapt.click"
  namespace           = "${get_env("TG_STATE_PREFIX", "")}medicapt"
  # TODO Change this
  user_reply_to_email = "andrei@0xab.com"
  base_source_url     = "${get_parent_terragrunt_dir()}/../../medicapt-infrastructure-modules//"
  account_id          = "926951938632"
  # TODO Cognito update for prod
  temporary_password_validity_days = 10
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
  records_dynamodb_kms_deletion_window_in_days = 7
  #
  api_file = "api.yaml"
  #
  budget_slack_webhook = "https://hooks.slack.com/services/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"
  budgets = [
    # We don't use EC2 but this is a common resource that attackers exploit.
    {
      name            = "budget-ec2-monthly"
      budget_type     = "COST"
      limit_amount    = "1"
      limit_unit      = "USD"
      time_unit       = "MONTHLY"
      cost_filter = {
        Service = ["Amazon Elastic Compute Cloud - Compute"]
      }
      notification = {
        comparison_operator = "GREATER_THAN"
        threshold           = "100"
        threshold_type      = "PERCENTAGE"
        notification_type   = "FORECASTED"
      }
    },
    {
      name         = "10-total-monthly"
      budget_type  = "COST"
      limit_amount = "10"
      limit_unit   = "USD"
      time_unit    = "MONTHLY"
      notification = {
        comparison_operator = "GREATER_THAN"
        threshold           = "100"
        threshold_type      = "PERCENTAGE"
        notification_type   = "FORECASTED"
      }
    },
    {
      name         = "100-total-monthly"
      budget_type  = "COST"
      limit_amount = "100"
      limit_unit   = "USD"
      time_unit    = "MONTHLY"
      notification = {
        comparison_operator = "GREATER_THAN"
        threshold           = "100"
        threshold_type      = "PERCENTAGE"
        notification_type   = "FORECASTED"
      }
    },
    {
      name         = "200-total-monthly"
      budget_type  = "COST"
      limit_amount = "200"
      limit_unit   = "USD"
      time_unit    = "MONTHLY"
      notification = {
        comparison_operator = "GREATER_THAN"
        threshold           = "100"
        threshold_type      = "PERCENTAGE"
        notification_type   = "FORECASTED"
      }
    },
    {
      name         = "1000-total-monthly"
      budget_type  = "COST"
      limit_amount = "1000"
      limit_unit   = "USD"
      time_unit    = "MONTHLY"
      notification = {
        comparison_operator = "GREATER_THAN"
        threshold           = "100"
        threshold_type      = "PERCENTAGE"
        notification_type   = "FORECASTED"
      }
    },
    # TODO What other budget categories make sense for PHR?
    #    If any?
    {
      name         = "s3-3GB-limit-monthly"
      budget_type  = "USAGE"
      limit_amount = "3"
      limit_unit   = "GB"
      time_unit    = "MONTHLY"
      notification = {
        comparison_operator = "GREATER_THAN"
        threshold           = "100"
        threshold_type      = "PERCENTAGE"
        notification_type   = "FORECASTED"
      }
    }
  ]
  dynamodb_point_in_time_recovery = true
}
