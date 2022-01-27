# resource "aws_acm_certificate" "cert" {
#   domain_name       = aws_route53_zone.domain_zone.name
#   validation_method = "DNS"

#   subject_alternative_names = [
#     "*.${aws_route53_zone.domain_zone.name}",
#   ]

#   lifecycle {
#     create_before_destroy = true
#   }
# }

# # AWS needs to verify that we own the domain; to prove this we will create a
# # DNS entry with a validation code
# resource "aws_route53_record" "cert_validation_record" {
#   name    = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_name
#   type    = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_type
#   records = [tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_value]
#   zone_id = aws_route53_zone.domain_zone.zone_id
#   ttl     = 60
# }

# resource "aws_acm_certificate_validation" "cert_validation" {
#   certificate_arn         = aws_acm_certificate.cert.arn
#   validation_record_fqdns = [aws_route53_record.cert_validation_record.fqdn]
# }

resource "aws_api_gateway_domain_name" "api_domain" {
  domain_name = "provider-api.${var.domain_name}"
  regional_certificate_arn = var.certificate_arn

  endpoint_configuration {
    types = [var.endpoint_configuration]
  }
}

resource "aws_api_gateway_base_path_mapping" "base_path_mapping" {
  api_id      = aws_api_gateway_rest_api.records.id
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

  # alias {
  #   name                   = aws_api_gateway_domain_name.api_domain.cloudfront_domain_name
  #   zone_id                = aws_api_gateway_domain_name.api_domain.cloudfront_zone_id
  #   evaluate_target_health = false
  # }
}

