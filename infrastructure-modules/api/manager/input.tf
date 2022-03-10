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

variable "lambda_insights_layer" {
  description = "The layer arn for lambda insights in this region: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-extension-versionsx86-64.html"
  type        = string
}

variable "cognito_user_pool_manager_arn" {
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

variable "user_type" {
  description = "The type of user, e.g., associate"
   type        = string
 }

variable "api_file" {
  description = "The API file name, e.g., api.yaml"
   type        = string
 }
