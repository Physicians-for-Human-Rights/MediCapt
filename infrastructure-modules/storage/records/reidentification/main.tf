terraform {
  required_version = ">= 1.1, < 1.2"
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

variable "records_bucket_arn" {
  description = "The ARN of the main records bucket"
  type        = string
}

variable "records_bucket_id" {
  description = "The ID of the main records bucket"
  type        = string
}

variable "lambda_uuid_layer" {
  description = "Access to UUID"
  type        = string
}

variable "lambda_insights_layer" {
  description = "The layer arn for lambda insights in this region: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-extension-versionsx86-64.html"
  type        = string
}


resource "aws_s3_bucket_notification" "triger" {
  bucket = var.records_bucket_id
  lambda_function {
    lambda_function_arn = aws_lambda_function.add_reidentification.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = "form.json"
  }
  depends_on = [
    aws_lambda_permission.execute
  ]
}

resource "aws_lambda_permission" "execute" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.add_reidentification.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.records_bucket_arn
}
