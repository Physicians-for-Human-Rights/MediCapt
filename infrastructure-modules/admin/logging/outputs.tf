output "alarm_topic" {
  value       = aws_sns_topic.admin_notifications
  description = "SNS Alarm topic"
}

output "logs_archive_bucket" {
  value       = aws_s3_bucket.logs_archive
  description = "S3 bucket with the archive logs"
}

output "instance_security_group_id" {
  value       = aws_s3_bucket.cloudtrail
  description = "S3 bucket with couldtrail logs"
}
