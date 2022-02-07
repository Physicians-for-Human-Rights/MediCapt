# TODO Add this back
# Blocked by localstack

# resource "aws_sqs_queue" "dead_letter_queue" {
#   name = "${var.stage}-${var.namespace}-s3-add-reidentification-dlq"
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
#   name   = "${var.namespace}-${var.stage}-reidentification-dead-letter-config"
#   description = "Provide access to the lambda dead letter queue"
#   policy = data.aws_iam_policy_document.dead_letter.json
# }

# resource "aws_iam_role_policy_attachment" "dead_letter" {
#   role       = aws_iam_role.lambda.name
#   policy_arn = aws_iam_policy.dead_letter.arn
# }
