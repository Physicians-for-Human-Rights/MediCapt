
resource "aws_cloudwatch_log_group" "api" {
  name = "${var.namespace}-${var.stage}-${var.user_type}-gateway"
  tags = {
    stage = var.stage
  }
  retention_in_days = 90
}
