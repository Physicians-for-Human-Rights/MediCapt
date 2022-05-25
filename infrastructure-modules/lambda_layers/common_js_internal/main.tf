locals {
  layer_name = "common_js_internal"
}

resource "null_resource" "build_lambda_layers" {
  # TODO What's the right trigger here?
  # triggers = {
  #   layer_build = "${md5(file("${path.module}/../../common-types.ts"))}"
  # }
  provisioner "local-exec" {
    working_dir = "${path.module}/nodejs/"
    command     = "rsync --delete -av ../../../dist-lambda/js/ . && cd .. && zip -9 -r --quiet ${local.layer_name}.zip nodejs"
    # command     = "cp ../../../dist-lambda/common-types.js node_modules/internal/ && cd .. && zip -9 -r --quiet ${local.layer_name}.zip nodejs"  }
  }
}

resource "aws_lambda_layer_version" "layer" {
  depends_on  = [null_resource.build_lambda_layers]
  filename    = "${path.module}/${local.layer_name}.zip"
  layer_name  = "${local.layer_name}"
  description = "common js files"
  compatible_runtimes = ["nodejs14.x"]
}

output "arn" {
  value = aws_lambda_layer_version.layer.arn
}
