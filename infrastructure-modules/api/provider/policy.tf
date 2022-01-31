resource "aws_iam_role" "cloudwatch" {
  name = "api_gateway_cloudwatch_global"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "cloudwatch" {
  name = "default"
  role = aws_iam_role.cloudwatch.id
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams",
                "logs:PutLogEvents",
                "logs:GetLogEvents",
                "logs:FilterLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

data "aws_iam_policy_document" "dead_letter" {
  statement {
    effect = "Allow"
    actions = [
      "sns:Publish",
      "sqs:SendMessage",
    ]
    resources = [
      aws_sqs_queue.dead_letter_queue.arn,
    ]
  }
}

resource "aws_iam_policy" "dead_letter" {
  name   = "${var.namespace}-${var.stage}_provider-dead-letter-config"
  description = "Provide access to the lambda dead letter queue"
  policy = data.aws_iam_policy_document.dead_letter.json
}
