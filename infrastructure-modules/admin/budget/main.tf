terraform {
  required_version = ">= 1.1, < 1.2"
}

variable "aws_region" {
  description = "The AWS region, e.g., us-east-1."
  type        = string
}

variable "stage" {
  description = "Development stage, e.g., prod."
  type        = string
}

variable "namespace" {
  description = "The namespace of the app, e.g., medicapt"
  type        = string
}

variable "budget_slack_webhook" {
  description = "The webook for slack, see the readme for instructions"
  type        = string
}

module "budgets" {
  source  = "cloudposse/budgets/aws"
  # Cloud Posse recommends pinning every module to a specific version
  # version = "x.x.x"
  version = "0.1.0"

  name = "${var.namespace}-${var.stage}-budget"

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

  # create an SNS topic and lambda for Slack notifications
  notifications_enabled = true
  slack_webhook_url     = var.budget_slack_webhook

  # encrypt SNS topic, this also creates a KMS CMK that allows `budgets.amazonaws.com` to use it
  encryption_enabled = true
}
