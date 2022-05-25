resource "aws_api_gateway_domain_name" "api_domain" {
  domain_name = "${var.user_type}-api.${var.domain_name}"
  regional_certificate_arn = var.certificate_arn

  endpoint_configuration {
    types = [var.endpoint_configuration]
  }
}

resource "aws_api_gateway_base_path_mapping" "base_path_mapping" {
  depends_on = [
    aws_api_gateway_stage.api
  ]
  api_id      = aws_api_gateway_rest_api.associate.id
  base_path   = ""
  stage_name  = var.stage

  domain_name = aws_api_gateway_domain_name.api_domain.domain_name
}

resource "aws_route53_record" "api" {
  name    = aws_api_gateway_domain_name.api_domain.domain_name
  type    = "A"
  zone_id = var.hosted_zone_id

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.api_domain.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.api_domain.regional_zone_id
  }

  #NB: If we switch from a regional to a local endpoint we need to flip this too.

  # alias {
  #   name                   = aws_api_gateway_domain_name.api_domain.cloudfront_domain_name
  #   zone_id                = aws_api_gateway_domain_name.api_domain.cloudfront_zone_id
  #   evaluate_target_health = false
  # }
}

