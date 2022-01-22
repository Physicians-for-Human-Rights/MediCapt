#!/bin/bash

export STAGE=dev
export REGION=us-east-1
export P=../medicapt-infrastructure/$STAGE/$REGION

export USER_POOL_ID=$(terragrunt output --terragrunt-working-dir $P/admin/users/provider       cognito_user_pool_id)
export APP_CLIENT_ID=$(terragrunt output --terragrunt-working-dir $P/admin/users/provider -json cognito_user_pool_client_web|jq '.id')
export IDENTITY_POOL_ID=$(terragrunt output --terragrunt-working-dir $P/admin/users/provider -json cognito_identity_pool|jq '.id')
export PROVIDER_URL=$(terragrunt output --terragrunt-working-dir $P/api/provider         -json aws_api_gateway_deployment_api|jq '.invoke_url')

envsubst < config.js.template > config.js
cat config.js
