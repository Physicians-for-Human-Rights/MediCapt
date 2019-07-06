variable "aws_region" {
  description = "The AWS region, e.g., us-east-1."
  type        = string
}

variable "stage" {
  description = "Development stage, e.g., prod."
  type        = string
}

variable "kms_key_arn" {
  description = "The ARN of the KMS CMK key to monitor."
  type        = string
}
