# TODO Reenable this, doesn't work in localstack
# But what do we do with it?

# resource "aws_sqs_queue" "dead_letter_queue" {
#   name = "${var.stage}-${var.namespace}-api-${var.user_type}-dlq"
#   #checkov:skip=CKV_AWS_27:We enabled server-side encryption, checkov only looks for CMK instead of SSE
#   sqs_managed_sse_enabled = true
# }

# data "aws_iam_policy_document" "dead_letter" {
#   statement {
#     effect = "Allow"
#     actions = [
#       "sns:Publish",
#       "sqs:SendMessage",
#     ]
#     resources = [
#       aws_sqs_queue.dead_letter_queue.arn,
#     ]
#   }
# }

# resource "aws_iam_policy" "dead_letter" {
#   name   = "${var.stage}-${var.namespace}-${var.user_type}-dead-letter-config"
#   description = "Provide access to the lambda dead letter queue"
#   policy = data.aws_iam_policy_document.dead_letter.json
# }

# resource "aws_iam_role_policy_attachment" "dead_letter" {
#   for_each = local.lambdas
#   #
#   role       = aws_iam_role.lambdas[each.key].name
#   policy_arn = aws_iam_policy.dead_letter.arn
# }
