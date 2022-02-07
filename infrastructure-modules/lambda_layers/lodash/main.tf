locals {
  layer_name = "lodash"
}

resource "null_resource" "build_lambda_layers" {
  triggers = {
    layer_build = "${md5(file("${path.module}/nodejs/package.json"))}"
  }
  provisioner "local-exec" {
    working_dir = "${path.module}/nodejs/"
    command     = "npm install --production && cd .. && zip -9 -r --quiet ${local.layer_name}.zip nodejs"
  }
}

resource "aws_lambda_layer_version" "layer" {
  depends_on  = [null_resource.build_lambda_layers]
  filename    = "${path.module}/${local.layer_name}.zip"
  layer_name  = "${local.layer_name}"
  description = "lodash for nodejs"
  compatible_runtimes = ["nodejs14.x"]
}

output "arn" {
  value = aws_lambda_layer_version.layer.arn
}
