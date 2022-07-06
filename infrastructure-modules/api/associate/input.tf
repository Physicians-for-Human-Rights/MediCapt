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

variable "cognito_user_pool_associate_arn" {
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

variable "humanid_lambda" {
  description = "The name of the humanid lambda function"
   type        = string
}

variable "humanid_lambda_arn" {
  description = "The ARN of the humanid lambda function"
   type        = string
}

variable "lambda_layer_modules" {
  description = "Access to the common js modules"
  type        = string
}

variable "lambda_layer_internal" {
  description = "Access to the common js internals"
  type        = string
}

variable "location_dynamodb" {
  description = "The location dynamodb"
  type        = any
}

variable "user_pool_provider" {
  description = "The provider user pool"
  type = string
}
variable "user_pool_associate" {
  description = "The associate user pool"
  type = string
}
variable "user_pool_manager" {
  description = "The manager user pool"
  type = string
}
variable "user_pool_formdesigner" {
  description = "The form designer user pool"
  type = string
}
variable "user_pool_researcher" {
  description = "The researcher user pool"
  type = string
}

variable "user_pool_provider_arn" {
  description = "The provider user pool ARN"
  type = string
}
variable "user_pool_associate_arn" {
  description = "The associate user pool ARN"
  type = string
}
variable "user_pool_manager_arn" {
  description = "The manager user pool ARN"
  type = string
}
variable "user_pool_formdesigner_arn" {
  description = "The form designer user pool ARN"
  type = string
}
variable "user_pool_researcher_arn" {
  description = "The researcher user pool ARN"
  type = string
}

variable "image_bucket_provider" {
  description = "The provider image bucket"
  type = string
}
variable "image_bucket_associate" {
  description = "The associate image bucket"
  type = string
}
variable "image_bucket_manager" {
  description = "The manager image bucket"
  type = string
}
variable "image_bucket_formdesigner" {
  description = "The form designer image bucket"
  type = string
}
variable "image_bucket_researcher" {
  description = "The researcher image bucket"
  type = string
}

variable "image_bucket_provider_arn" {
  description = "The provider image bucket ARN"
  type = string
}
variable "image_bucket_associate_arn" {
  description = "The associate image bucket ARN"
  type = string
}
variable "image_bucket_manager_arn" {
  description = "The manager image bucket ARN"
  type = string
}
variable "image_bucket_formdesigner_arn" {
  description = "The form designer image bucket ARN"
  type = string
}
variable "image_bucket_researcher_arn" {
  description = "The researcher image bucket ARN"
  type = string
}

variable "form_dynamodb" {
  description = "The form dynamodb"
  type        = any
}

variable "form_table" {
  description = "The form dynamodb table name"
  type        = string
}
variable "form_table_arn" {
  description = "The form dynamodb table ARN"
  type        = string
}
variable "form_bucket" {
  description = "The name of the S3 bucket that stores forms"
  type        = string
}
variable "form_bucket_arn" {
  description = "The arn of the S3 bucket that stores forms"
  type        = string
}

variable "record_dynamodb" {
  description = "The record dynamodb"
  type        = any
}
variable "record_table" {
  description = "The record dynamodb table name"
  type        = string
}
variable "record_table_arn" {
  description = "The record dynamodb table ARN"
  type        = string
}
variable "record_table_kms" {
  description = "The KMS of the record dynamodb"
  type        = any
}
variable "record_bucket" {
  description = "The name of the S3 bucket that stores records"
  type        = string
}
variable "record_bucket_arn" {
  description = "The arn of the S3 bucket that stores records"
  type        = string
}
variable "record_bucket_kms" {
  description = "The kms of the S3 bucket that stores records"
  type        = any
}

variable "sharing_dynamodb" {
  description = "The sharing dynamodb"
  type        = any
}
variable "sharing_table" {
  description = "The sharing dynamodb table name"
  type        = string
}
variable "sharing_table_arn" {
  description = "The sharing dynamodb table ARN"
  type        = string
}
variable "sharing_table_kms" {
  description = "The KMS of the sharing dynamodb table ARN"
  type        = any
}

variable "user_type" {
  description = "The type of user, e.g., associate"
  type        = string
}

variable "api_file" {
  description = "The API file name, e.g., api.yaml"
  type        = string
}
