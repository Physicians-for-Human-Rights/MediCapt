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

data "aws_caller_identity" "current" {}

data "aws_kms_key" "master" {
  key_id = var.kms_key_id
}

resource "aws_s3_bucket" "storage" {
  bucket = "${var.namespace}-${var.backend}-${var.stage}"
  lifecycle_rule {
    enabled = true
    abort_incomplete_multipart_upload_days = 7
  }
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = "${data.aws_kms_key.master.arn}"
        sse_algorithm = "aws:kms"
      }
    }
  }
}

resource "aws_s3_bucket_policy" "storage" {
  bucket = "${aws_s3_bucket.storage.id}"

  # TODO This policy allows deletion from the console. Should we remove it in prod?
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "StoragePolicy",
  "Statement": [
    {
      "Sid": "AllowConsole",
      "Effect": "Allow",
      "Principal": 
           {"AWS": 
              ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root",
               "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/cfn"]
           },
      "Action": "s3:*",
      "Resource": [ "${aws_s3_bucket.storage.arn}", 
                    "${aws_s3_bucket.storage.arn}/*" ]
    },
    {
        "Sid": "DenyUnsecure",
        "Effect": "Deny",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::/*",
        "Condition": {
            "Bool": {
                "aws:SecureTransport": "false"
            }
        }
    },
    {
      "Sid": "AllowOnlyFromVPC",
      "Effect": "Deny",
      "NotPrincipal": {"AWS": 
              ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root",
               "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/cfn"]
           },
      "Action": "s3:*",
      "Resource": [ "${aws_s3_bucket.storage.arn}",
                    "${aws_s3_bucket.storage.arn}/*" ],
      "Condition": {
         "StringNotEquals": {
             "aws:sourceVpc": "${data.terraform_remote_state.vpc.outputs.vpc.vpc_id}"
         }
      }
    },
    {
        "Sid": "DenyPublicReadACL",
        "Effect": "Deny",
        "Principal": {
            "AWS": "*"
        },
        "Action": [
            "s3:PutObject",
            "s3:PutObjectAcl"
        ],
        "Resource": "${aws_s3_bucket.storage.arn}/*",
        "Condition": {
            "StringEquals": {
                "s3:x-amz-acl": [
                    "public-read",
                    "public-read-write",
                    "authenticated-read"
                ]
            }
        }
    },
    {
        "Sid": "DenyPublicReadGrant",
        "Effect": "Deny",
        "Principal": {
            "AWS": "*"
        },
        "Action": [
            "s3:PutObject",
            "s3:PutObjectAcl"
        ],
        "Resource": "${aws_s3_bucket.storage.arn}/*",
        "Condition": {
            "StringLike": {
                "s3:x-amz-grant-read": [
                    "*http://acs.amazonaws.com/groups/global/AllUsers*",
                    "*http://acs.amazonaws.com/groups/global/AuthenticatedUsers*"
                ]
            }
        }
    },
    {
        "Sid": "DenyPublicListACL",
        "Effect": "Deny",
        "Principal": {
            "AWS": "*"
        },
        "Action": "s3:PutBucketAcl",
        "Resource": "${aws_s3_bucket.storage.arn}",
        "Condition": {
            "StringEquals": {
                "s3:x-amz-acl": [
                    "public-read",
                    "public-read-write",
                    "authenticated-read"
                ]
            }
        }
    },
    {
        "Sid": "DenyPublicListGrant",
        "Effect": "Deny",
        "Principal": {
            "AWS": "*"
        },
        "Action": "s3:PutBucketAcl",
        "Resource": "${aws_s3_bucket.storage.arn}",
        "Condition": {
            "StringLike": {
                "s3:x-amz-grant-read": [
                    "*http://acs.amazonaws.com/groups/global/AllUsers*",
                    "*http://acs.amazonaws.com/groups/global/AuthenticatedUsers*"
                ]
            }
        }
    },
    {
      "Sid": "DenyUnEncryptedObjectUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "${aws_s3_bucket.storage.arn}/*",
      "Condition": {
         "StringNotEquals":
            { "s3:x-amz-server-side-encryption": "aws-kms",
              "s3:x-amz-server-side-encryption-aws-kms-key-id":
                "${data.aws_kms_key.master.arn}" }
      }
    }
  ]
}
POLICY
}

# We create a custom endpoint for the VPC so that we can attach a policy to
# it. This isn't possible with the VPC module directly.

data "aws_vpc_endpoint_service" "s3" {
  service = "s3"
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id       = data.terraform_remote_state.vpc.outputs.vpc.vpc_id
  service_name = data.aws_vpc_endpoint_service.s3.service_name
  policy       = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "AllowInVPCS3",
  "Statement": [
    {
      "Sid": "AllowThisVPCS3",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": ["${aws_s3_bucket.storage.arn}",
                   "${aws_s3_bucket.storage.arn}/*"]
    }
  ]
}
POLICY
}

resource "aws_vpc_endpoint_route_table_association" "private_s3" {
  count = length(data.terraform_remote_state.vpc.outputs.vpc.natgw_ids)
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
  route_table_id  = element(data.terraform_remote_state.vpc.outputs.vpc.private_route_table_ids, count.index)
}

resource "aws_vpc_endpoint_route_table_association" "intra_s3" {
  count = length(data.terraform_remote_state.vpc.outputs.vpc.intra_subnets) > 0 ? 1 : 0
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
  route_table_id  = element(data.terraform_remote_state.vpc.outputs.vpc.intra_route_table_ids, 0)
}

resource "aws_vpc_endpoint_route_table_association" "public_s3" {
  count = length(data.terraform_remote_state.vpc.outputs.vpc.public_subnets) > 0 ? 1 : 0
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
  route_table_id  = element(data.terraform_remote_state.vpc.outputs.vpc.public_route_table_ids, 0)
}

output "s3_bucket" {
  description = "The S3 bucket"
  value       = aws_s3_bucket.storage
}

output "s3_endpoint" {
  description = "The S3 endpoint"
  value       = aws_vpc_endpoint.s3
}
