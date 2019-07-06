terraform {
  required_version = ">= 0.12, < 0.13"
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region
  version = "~> 2.0"
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

variable "backend" {
  description = "The backend, e.g., metadata."
  type        = string
}

variable "classB" {
  description = "The classB of the VPC"
  type        = number
}

variable "flow_logs_traffic_type" {
  description = "The traffic type of the flow flogs (ACCEPT, REJECT, ALL)"
  type        = string
}

variable "flow_logs_retention_in_days" {
  description = "Days to keep the logs"
  type        = number
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 2.0"
  name = "vpc-${var.namespace}-${var.backend}-${var.stage}"
  cidr = "10.${var.classB}.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  enable_nat_gateway   = false
  azs = ["${var.aws_region}a", "${var.aws_region}b"]
  public_subnets      = ["10.${var.classB}.1.0/24", "10.${var.classB}.2.0/24"]
  private_subnets     = ["10.${var.classB}.16.0/24", "10.${var.classB}.17.0/24"]
  # We want this, but we build it when we create the S3 bucket.
  # This allows us to set amore restrictive access policy.
  #
  # enable_s3_endpoint = true
}

resource "aws_cloudwatch_log_group" "flow_logs" {
  name              = "flow-logs-${var.namespace}-${var.backend}-${var.stage}"
  retention_in_days = var.flow_logs_retention_in_days
}

resource "aws_iam_role" "flow_logs" {
  name = "flow-logs-${var.namespace}-${var.backend}-${var.stage}"
  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AssumeRolePolicyDocument",
            "Action": "sts:AssumeRole",
            "Principal": {
               "Service": "vpc-flow-logs.amazonaws.com"
            },
            "Effect": "Allow"
        }
    ]
}
EOF
}

resource "aws_iam_role_policy" "flow_logs" {
  name = "cloudwatch-${var.namespace}-${var.backend}-${var.stage}"
  role = "${aws_iam_role.flow_logs.id}"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "FlowLogsPolicy",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": [
        "${aws_cloudwatch_log_group.flow_logs.arn}"
      ]
    }
  ]
}
EOF
}

resource "aws_flow_log" "vpc" {
  log_group_name = aws_cloudwatch_log_group.flow_logs.name
  iam_role_arn   = aws_iam_role.flow_logs.arn
  vpc_id         = module.vpc.vpc_id
  traffic_type   = var.flow_logs_traffic_type
}

output "vpc" {
  value = module.vpc
  description = "The VPC"
}

output "vpc-flow-log-iam" {
  value = aws_iam_role.flow_logs
  description = "The IAM for flow logs"
}

output "vpc-flow-log-group" {
  value = aws_flow_log.vpc
  description = "The flow logs"
}
