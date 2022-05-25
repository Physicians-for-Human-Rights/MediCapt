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

variable "budgets" {
  description = "A list of budgets"
  type        = any
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

  budgets = var.budgets

  # create an SNS topic and lambda for Slack notifications
  notifications_enabled = true
  slack_webhook_url     = var.budget_slack_webhook

  # encrypt SNS topic, this also creates a KMS CMK that allows `budgets.amazonaws.com` to use it
  encryption_enabled = true
}
