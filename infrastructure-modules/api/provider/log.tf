
resource "aws_cloudwatch_log_group" "api" {
  name = "${var.namespace}-${var.stage}-provider-gateway"
  tags = {
    stage = var.stage
  }
}
