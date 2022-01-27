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

variable "domain_name" {
  description = "Where we want to deploy this API"
  type        = string
}

variable "certificate_arn" {
  description = "Certificate ARN from ACM for our domain"
  type        = string
}

variable "endpoint_configuration" {
  description = "What kind of endpoint is this e.g., REGIONAL"
  type        = string
}

variable "hosted_zone_id" {
  description = "The hosted zone id for the API gateway"
  type        = string
}

