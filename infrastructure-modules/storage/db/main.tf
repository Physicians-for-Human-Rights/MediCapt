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

variable "kms_key_id" {
  description = "The ID of the KMS CMK key to monitor."
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

data "terraform_remote_state" "logging" {
  backend = "s3"
  config = {
    bucket         = "medicapt-terraform-state"
    region         = var.aws_region
    key            = "admin/logging/terraform.tfstate"
  }
}

data "aws_caller_identity" "current" {}

data "aws_kms_key" "master" {
  key_id = var.kms_key_id
}

data "aws_ssm_parameter" "db_password" {
  name = "${var.namespace}-${var.backend}-${var.stage}-db-password"
}

resource "aws_secretsmanager_secret" "db_password" {
  kms_key_id          = "${data.aws_kms_key.master.key_id}"
  name                = "${var.namespace}-${var.backend}-${var.stage}-db-password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  lifecycle {
    ignore_changes = [
      "secret_string"
    ]
  }
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = <<EOF
{
  "username": "${aws_rds_cluster.db.master_username}",
  "engine": "aurora",
  "dbname": "medicapt",
  "host": "${aws_rds_cluster.db.endpoint}",
  "password": "${data.aws_ssm_parameter.db_password.value}",
  "port": ${aws_rds_cluster.db.port},
  "dbInstanceIdentifier": "${var.namespace}-${var.backend}-${var.stage}"
}
EOF
}

resource "aws_db_subnet_group" "db" {
  name        = "${var.namespace}-${var.backend}-${var.stage}"
  subnet_ids = data.terraform_remote_state.vpc.outputs.vpc.private_subnets
}

resource "aws_rds_cluster_parameter_group" "db" {
  name        = "${var.namespace}-${var.backend}-${var.stage}"
  family      = "aurora5.6"
  description = "RDS default cluster parameter group"
  parameter {
    name  = "time_zone"
    value = "UTC"
  }
  parameter {
    name  = "character_set_client"
    value = "utf8"
  }
  parameter {
    name  = "character_set_connection"
    value = "utf8"
  }
  parameter {
    name  = "character_set_database"
    value = "utf8"
  }
  parameter {
    name  = "character_set_results"
    value = "utf8"
  }
  parameter {
    name  = "character_set_filesystem"
    value = "utf8"
  }
  parameter {
    name  = "character_set_server"
    value = "utf8"
  }
  parameter {
    name  = "collation_connection"
    value = "utf8_general_ci"
  }
  parameter {
    name  = "collation_server"
    value = "utf8_general_ci"
  }
}

resource "aws_rds_cluster" "db" {
  cluster_identifier = "${var.namespace}-${var.backend}-${var.stage}"
  engine          = "aurora"
  engine_mode     = "serverless"
  # engine_version  = "5.6.10a"
  kms_key_id      = data.aws_kms_key.master.arn
  storage_encrypted = true
  master_username  = "admin"
  master_password  = data.aws_ssm_parameter.db_password.value
  apply_immediately = true # TODO This should one day become false
  vpc_security_group_ids = [data.terraform_remote_state.vpc.outputs.vpc.default_security_group_id]
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.db.name
  db_subnet_group_name = aws_db_subnet_group.db.name
  scaling_configuration {
    auto_pause               = true
    max_capacity             = 1
    min_capacity             = 1
    seconds_until_auto_pause = 300
  }
  lifecycle {
    ignore_changes = [
      "engine_version",
    ]
  }
}

# TODO I had to disable this because updating the db was hanging in terraform. Reenable
# resource "aws_db_event_subscription" "db" {
#   name      = "${var.namespace}-${var.backend}-${var.stage}"
#   sns_topic = data.terraform_remote_state.logging.outputs.alarm_topic.arn
#   # TODO Shouldn't this be the right source type?
#   # source_type = "db-cluster"
#   source_ids  = [aws_rds_cluster.db.id]
#   event_categories = [
#     "availability",
#     "deletion",
#     "failover",
#     "failure",
#     "low storage",
#     "maintenance",
#     "notification",
#     "read replica",
#     "recovery",
#     "restoration",
#   ]
# }

output "db" {
  description = "RDS cluster"
  value       = aws_rds_cluster.db
}

# output "db_events" {
#   description = "Database event subscription"
#   value       = aws_db_event_subscription.db
# }

output "db_secret" {
  description = "Secret Manager secret for db connections"
  value       = aws_secretsmanager_secret.db_password
}
