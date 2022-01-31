output "aws_api_gateway_rest_api_provider" {
  value = aws_api_gateway_rest_api.provider
  description = "The provider gateway"
}

output "aws_api_gateway_deployment_api" {
  value = aws_api_gateway_deployment.api
  description = "The provider gateway deployment"
}

output "aws_api_gateway_domain_name_id" {
  value = aws_api_gateway_domain_name.api_domain.id
  description = "Domain name id"
}

output "aws_api_gateway_domain_name_arn" {
  value = aws_api_gateway_domain_name.api_domain.arn
  description = "Domain name arn"
}

output "regional_domain_name" {
  value = aws_api_gateway_domain_name.api_domain.regional_domain_name
  description = "Regional domain name"
}

output "cloudfront_domain_name" {
  value = aws_api_gateway_domain_name.api_domain.cloudfront_domain_name
  description = "CF domain name"
}
