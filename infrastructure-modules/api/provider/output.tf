output "aws_api_gateway_rest_api_records" {
  value = aws_api_gateway_rest_api.records
  description = "The records gateway"
}

output "aws_api_gateway_deployment_api" {
  value = aws_api_gateway_deployment.api
  description = "The records gateway deployment"
}
