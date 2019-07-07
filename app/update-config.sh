#!/bin/bash

export STAGE=dev
export P=../medicapt-infrastructure/$STAGE

export REGION=$(terragrunt output --terragrunt-working-dir $P/storage/s3/s3-deidentified -json s3_bucket|jq '.region')
export USER_POOL_ID=$(terragrunt output --terragrunt-working-dir $P/admin/users-providers -json cognito_user_pool_main|jq '.id')
export APP_CLIENT_ID=$(terragrunt output --terragrunt-working-dir $P/admin/users-providers -json cognito_user_pool_client_web|jq '.id')
export IDENTITY_POOL_ID=$(terragrunt output --terragrunt-working-dir $P/admin/users-providers -json cognito_identity_pool_main|jq '.id')
export RECORDS_URL=$(terragrunt output --terragrunt-working-dir $P/api/records -json aws_api_gateway_deployment_api|jq '.invoke_url')
export RECORDS_DB=$(terragrunt output --terragrunt-working-dir $P/storage/db/db-records -json db|jq '.id')
export RECORDS_BUCKET=$(terragrunt output --terragrunt-working-dir $P/storage/s3/s3-records -json s3_bucket|jq '.bucket')

envsubst < config.js.template > config.js
