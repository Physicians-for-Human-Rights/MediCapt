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

variable "cognito_user_pool_provider_arn" {
  description = "The ARN of the cognito user pool that can call these functions"
  type        = string
}
