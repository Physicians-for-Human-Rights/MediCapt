terraform {
  required_version = ">= 0.12, < 0.13"
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region
  version = "~> 2.0"
}

variable "namespace" {
  description = "The namespace of the app, e.g., medicapt"
  type        = string
}

data "aws_caller_identity" "current" {}

resource "aws_sns_topic" "admin_notifications" {
  name = "admin-notifications"
}

resource "aws_s3_bucket" "logs_archive" {
  bucket = "logs-archive-${var.namespace}-${var.stage}"
  acl    = "log-delivery-write"
  versioning { enabled = true }
  lifecycle_rule {
    id = "Transition60daysRetain7yrs"
    enabled = true
    expiration {
      days = 2555
    }
    transition {
      days = 30
      storage_class = "STANDARD_IA" # or "ONEZONE_IA"
    }
    transition {
      days = 60
      storage_class = "GLACIER"
    }
  }
}

resource "aws_s3_bucket_policy" "logs_archive" {
  bucket = "${aws_s3_bucket.logs_archive.id}"
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "Archive bucket policy",
  "Statement": [
    {
      "Sid": "Enforce HTTPS Connections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "${aws_s3_bucket.logs_archive.arn}/*",
      "Condition": {
         "Bool": {"aws:SecureTransport": "false"}
      }
    },
    {
      "Sid": "Restrict Delete* Actions",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:Delete*",
      "Resource": "${aws_s3_bucket.logs_archive.arn}/*"
    },
    {
      "Sid": "DenyUnEncryptedObjectUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "${aws_s3_bucket.logs_archive.arn}/*",
      "Condition": {
         "StringNotEquals": {"s3:x-amz-server-side-encryption": "AES256"}
      }
    }
  ]
}
POLICY
}

resource "aws_s3_bucket" "cloudtrail" {
  bucket = "cloudtrail-${var.namespace}-${var.stage}"
  acl    = "private"
  versioning { enabled = true }
  logging {
    target_bucket = "${aws_s3_bucket.logs_archive.id}"
    target_prefix = "cloudtrail-logs/"
  }
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  bucket = "${aws_s3_bucket.cloudtrail.id}"
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "Archive bucket policy",
  "Statement": [
    {
      "Sid": "AWSCloudTrailAclCheck20150319",
      "Effect": "Allow",
      "Principal": {"Service": "cloudtrail.amazonaws.com"},
      "Action": "s3:GetBucketAcl",
      "Resource": "${aws_s3_bucket.cloudtrail.arn}"
    },
    {
      "Sid": "AWSCloudTrailWrite20150319",
      "Effect": "Allow",
      "Principal": {"Service": "cloudtrail.amazonaws.com"},
      "Action": "s3:PutObject",
      "Resource": "${aws_s3_bucket.cloudtrail.arn}/*",
      "Condition": {
         "StringEquals": {
            "s3:x-amz-acl": "bucket-owner-full-control"
         }
      }
    },
    {
      "Sid": "Enforce HTTPS Connections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "${aws_s3_bucket.cloudtrail.arn}/*",
      "Condition": {
         "Bool": {"aws:SecureTransport": "false"}
      }
    },
    {
      "Sid": "Restrict Delete* actions",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:Delete*",
      "Resource": "${aws_s3_bucket.cloudtrail.arn}/*"
    },
    {
      "Sid": "DenyUnEncryptedObjectUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "${aws_s3_bucket.cloudtrail.arn}/*",
      "Condition": {
         "StringNotEquals": {"s3:x-amz-server-side-encryption": "AES256"}
      }
    }
  ]
}
POLICY
}

resource "aws_cloudwatch_log_group" "cloudtrail" {
  retention_in_days = 90
}

resource "aws_cloudtrail" "local" {
  name = "${var.namespace}-${var.stage}"
  s3_bucket_name = "${aws_s3_bucket.cloudtrail.id}"
  enable_logging = true
  enable_log_file_validation = true
  include_global_service_events = true
  cloud_watch_logs_group_arn = "${aws_cloudwatch_log_group.cloudtrail.arn}"
  cloud_watch_logs_role_arn = "${aws_iam_role.cloudwatch.arn}"
  depends_on = ["aws_s3_bucket_policy.cloudtrail", "aws_iam_role_policy.cloudtrail"]
}

resource "aws_iam_role" "cloudwatch" {
  name = "cloudwatch-${var.namespace}-${var.stage}"
  path = "/"
  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
               "Service": "cloudtrail.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }
    ]
}
EOF
}

resource "aws_iam_role_policy" "cloudwatch" {
  name = "cloudwatch-${var.namespace}-${var.stage}"
  role = "${aws_iam_role.cloudwatch.id}"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AWSCloudTrailCreateLogStream2014110",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream"
      ],
      "Resource": [
        "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:${aws_cloudwatch_log_group.cloudtrail.name}:log-stream:*"
      ]
    },
    {
      "Sid": "AWSCloudTrailPutLogEvents20141101",
      "Effect": "Allow",
      "Action": [
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:${aws_cloudwatch_log_group.cloudtrail.name}:log-stream:*"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_role" "cloudtrail" {
  name = "cloudtrail-${var.namespace}-${var.stage}"
  path = "/"
  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
               "Service": "ec2.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }
    ]
}
EOF
}

resource "aws_iam_role_policy" "cloudtrail" {
  name = "cloudtrail-${var.namespace}-${var.stage}"
  role = "${aws_iam_role.cloudtrail.id}"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": [ "${aws_s3_bucket.cloudtrail.arn}" ]
    },
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": [ "${aws_s3_bucket.cloudtrail.arn}/*" ]
    }
  ]
}
EOF
}

resource "aws_iam_instance_profile" "cloudtrail" {
  name = "cloudtrail-${var.namespace}-${var.stage}"
  path = "/"
  role = "${aws_iam_role.cloudtrail.name}"
}

resource "aws_cloudwatch_log_metric_filter" "iam_policy_changes" {
  name           = "IAM-policy-changes-${var.namespace}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.cloudtrail.name}"
  pattern        = <<EOF
        {
          ($.eventName=DeleteGroupPolicy) ||
          ($.eventName=DeleteRolePolicy) ||
          ($.eventName=DeleteUserPolicy) ||
          ($.eventName=PutGroupPolicy) ||
          ($.eventName=PutRolePolicy) ||
          ($.eventName=PutUserPolicy) ||
          ($.eventName=CreatePolicy) ||
          ($.eventName=DeletePolicy) ||
          ($.eventName=CreatePolicyVersion) ||
          ($.eventName=DeletePolicyVersion) ||
          ($.eventName=AttachRolePolicy) ||
          ($.eventName=DetachRolePolicy) ||
          ($.eventName=AttachUserPolicy) ||
          ($.eventName=DetachUserPolicy) ||
          ($.eventName=AttachGroupPolicy) ||
          ($.eventName=DetachGroupPolicy)
        }
EOF
  metric_transformation {
    name      = "IAMPolicyEventCount"
    namespace = "CloudTrailMetrics-${var.namespace}-${var.stage}"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "iam_policy_changes" {
  alarm_name                = "iam-policy-changes-${var.namespace}-${var.stage}"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  namespace                 = "CloudTrailMetrics-${var.namespace}-${var.stage}"
  metric_name               = "IAMPolicyEventCount"
  period                    = "300"
  statistic                 = "Sum"
  threshold                 = "1"
  alarm_description         = "Alarms when an IAM group, user, or policy changes"
  alarm_actions             = ["${aws_sns_topic.admin_notifications.arn}"]
}

resource "aws_cloudwatch_log_metric_filter" "network_acl_changes" {
  name           = "ACL-policy-changes-${var.namespace}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.cloudtrail.name}"
  pattern        = <<EOF
        {
          ($.eventName = CreateNetworkAcl) ||
          ($.eventName = CreateNetworkAclEntry) ||
          ($.eventName = DeleteNetworkAcl) ||
          ($.eventName = DeleteNetworkAclEntry) ||
          ($.eventName = ReplaceNetworkAclEntry) ||
          ($.eventName = ReplaceNetworkAclAssociation)
        }
EOF
  metric_transformation {
    namespace = "CloudTrailMetrics-${var.namespace}-${var.stage}"
    name      = "NetworkAclEventCount"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "network_acl_changes" {
  alarm_name                = "network-acl-changes-${var.namespace}-${var.stage}"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  namespace                 = "CloudTrailMetrics-${var.namespace}-${var.stage}"
  metric_name               = "IAMPolicyEventCount"
  period                    = "300"
  statistic                 = "Sum"
  threshold                 = "1"
  alarm_description         = "Alarms when an API call is made to create, update or delete"
  alarm_actions             = ["${aws_sns_topic.admin_notifications.arn}"]
}

resource "aws_cloudwatch_log_metric_filter" "security_group_changes" {
  name           = "security-group-changes-${var.namespace}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.cloudtrail.name}"
  pattern        = <<EOF
        {
          ($.eventName = AuthorizeSecurityGroupIngress) ||
          ($.eventName = AuthorizeSecurityGroupEgress) ||
          ($.eventName = RevokeSecurityGroupIngress) ||
          ($.eventName = RevokeSecurityGroupEgress) ||
          ($.eventName = CreateSecurityGroup) ||
          ($.eventName = DeleteSecurityGroup)
        }
EOF
  metric_transformation {
    namespace = "CloudTrailMetrics-${var.namespace}-${var.stage}"
    name      = "SecurityGroupEventCount"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "security_group_changes" {
  alarm_name                = "security-group-changes-${var.namespace}-${var.stage}"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  namespace                 = "CloudTrailMetrics-${var.namespace}-${var.stage}"
  metric_name               = "SecurityGroupEventCount"
  period                    = "300"
  statistic                 = "Sum"
  threshold                 = "1"
  alarm_description         = "Alarms when a ecurity group changes"
  alarm_actions             = ["${aws_sns_topic.admin_notifications.arn}"]
}

resource "aws_cloudwatch_log_metric_filter" "root_activity" {
  name           = "root-activity-${var.namespace}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.cloudtrail.name}"
  pattern        = <<EOF
        {
          ($.userIdentity.type = "Root") &&
          ($.userIdentity.invokedBy NOT EXISTS) &&
          ($.eventType != "AwsServiceEvent")
        }
EOF
  metric_transformation {
    namespace = "CloudTrailMetrics-${var.namespace}-${var.stage}"
    name      = "RootUserPolicyEventCount"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "root_activity" {
  alarm_name                = "root-activity-${var.namespace}-${var.stage}"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  namespace                 = "CloudTrailMetrics-${var.namespace}-${var.stage}"
  metric_name               = "RootUserPolicyEventCount"
  period                    = "300"
  statistic                 = "Sum"
  threshold                 = "1"
  alarm_description         = "Root user activity detected!"
  alarm_actions             = ["${aws_sns_topic.admin_notifications.arn}"]
}

resource "aws_cloudwatch_log_metric_filter" "unathorized_attempt" {
  name           = "unathorized-attempt-${var.namespace}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.cloudtrail.name}"
  pattern        = <<EOF
        {
          ($.errorCode=AccessDenied) ||
          ($.errorCode=UnauthorizedOperation)
        }
EOF
  metric_transformation {
    namespace = "CloudTrailMetrics-${var.namespace}-${var.stage}"
    name      = "UnauthorizedAttemptCount"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "unathorized_attempt" {
  alarm_name                = "unathorized-attempt-${var.namespace}-${var.stage}"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  namespace                 = "CloudTrailMetrics-${var.namespace}-${var.stage}"
  metric_name               = "UnauthorizedAttemptCount"
  period                    = "300"
  statistic                 = "Sum"
  threshold                 = "5"
  alarm_description         = "Multiple unauthorized actions or logins attempted!"
  alarm_actions             = ["${aws_sns_topic.admin_notifications.arn}"]
}

resource "aws_cloudwatch_log_metric_filter" "iam_create_access_key" {
  name           = "iam-create-access-key-${var.namespace}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.cloudtrail.name}"
  pattern        = <<EOF
        {
          ($.eventName=CreateAccessKey)
        }
EOF
  metric_transformation {
    namespace = "CloudTrailMetrics-${var.namespace}-${var.stage}"
    name      = "NewAccessKeyCreated"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "iam_create_access_key" {
  alarm_name                = "iam-create-access-key-${var.namespace}-${var.stage}"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  namespace                 = "CloudTrailMetrics-${var.namespace}-${var.stage}"
  metric_name               = "NewAccessKeyCreated"
  period                    = "300"
  statistic                 = "Sum"
  threshold                 = "1"
  alarm_description         = "Warning: New IAM access key was created. Please be sure this action was neccessary."
  alarm_actions             = ["${aws_sns_topic.admin_notifications.arn}"]
}

resource "aws_cloudwatch_log_metric_filter" "cloudtrail_change" {
  name           = "cloudtrail-change-${var.namespace}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.cloudtrail.name}"
  pattern        = <<EOF
        {
          ($.eventSource = cloudtrail.amazonaws.com) &&
          (
            ($.eventName != Describe*) &&
            ($.eventName != Get*) &&
            ($.eventName != Lookup*) &&
            ($.eventName != List*)
          )
        }
EOF
  metric_transformation {
    namespace = "CloudTrailMetrics-${var.namespace}-${var.stage}"
    name      = "CloudTrailChangeCount"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "cloudtrail_change" {
  alarm_name                = "cloudtrail-change-${var.namespace}-${var.stage}"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  namespace                 = "CloudTrailMetrics-${var.namespace}-${var.stage}"
  metric_name               = "NewAccessKeyCreated"
  period                    = "300"
  statistic                 = "Sum"
  threshold                 = "1"
  alarm_description         = "Warning: Changes to CloudTrail log configuration detected in this account."
  alarm_actions             = ["${aws_sns_topic.admin_notifications.arn}"]
}

resource "aws_cloudwatch_event_rule" "kms_key_alert" {
  name        = "kms_key_alert-${var.namespace}-${var.stage}"
  description = "Attempts to delete or disable a KMS CMK"
  event_pattern = <<PATTERN
{
  "detail-type": [
    "AWS API Call via CloudTrail"
  ],
  "detail": {
    "eventSource": ["kms.amazonaws.com"],
    "eventName": ["ScheduleKeyDeletion", "DisableKey"]
  }
}
PATTERN
}

resource "aws_cloudwatch_event_target" "kms_key_alert" {
  rule      = "${aws_cloudwatch_event_rule.kms_key_alert.name}"
  target_id = "SendToSNS"
  arn       = "${aws_sns_topic.admin_notifications.arn}"
}
