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

data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket         = "medicapt-terraform-state"
    region         = var.aws_region
    key            = "networking/vpc/vpc-${var.backend}/terraform.tfstate"
  }
}

data "terraform_remote_state" "db" {
  backend = "s3"
  config = {
    bucket         = "medicapt-terraform-state"
    region         = var.aws_region
    key            = "storage/db/db-${var.backend}/terraform.tfstate"
  }
}

data "aws_caller_identity" "current" {}

data "aws_security_group" "cloud9" {
  name = "aws-cloud9-${var.namespace}-${var.backend}-${var.stage}*"
  depends_on = [aws_cloud9_environment_ec2.main]
}

resource "aws_cloud9_environment_ec2" "main" {
  instance_type = "t2.micro"
  name          = "${var.namespace}-${var.backend}-${var.stage}"
  automatic_stop_time_minutes = 5
  owner_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
  subnet_id = data.terraform_remote_state.vpc.outputs.vpc.public_subnets[0]
}

# TODO This setup seems to force constant replacement of this rule, but it works.
resource "aws_security_group_rule" "allow_access" {
  type                     = "ingress"
  from_port                = data.terraform_remote_state.db.outputs.db.port
  to_port                  = data.terraform_remote_state.db.outputs.db.port
  protocol                 = "tcp"
  source_security_group_id = data.aws_security_group.cloud9.id
  security_group_id        = data.terraform_remote_state.vpc.outputs.vpc.default_security_group_id
}

output "cloud9" {
  description = "Cloud9 environment"
  value       = aws_cloud9_environment_ec2.main
}
