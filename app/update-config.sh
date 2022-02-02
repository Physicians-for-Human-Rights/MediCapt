#!/bin/bash

export STAGE=dev
export REGION=us-east-1
export P=../medicapt-infrastructure/$STAGE/$REGION

export PROVIDER_USER_POOL_ID=$(terragrunt output              --terragrunt-working-dir $P/admin/users/provider cognito_user_pool_id)
export PROVIDER_APP_CLIENT_ID=$(terragrunt output             --terragrunt-working-dir $P/admin/users/provider -json cognito_user_pool_client_web|jq '.id')
export PROVIDER_IDENTITY_POOL_ID=$(terragrunt output          --terragrunt-working-dir $P/admin/users/provider -json cognito_identity_pool|jq '.id')
export PROVIDER_URL=$(printf '"%s%s/"'  $(terragrunt output   --terragrunt-working-dir $P/api/provider -json aws_api_gateway_deployment_api|jq '.invoke_url'|cut -d '"' -f 2) $STAGE)

export ASSOCIATE_USER_POOL_ID=$(terragrunt output             --terragrunt-working-dir $P/admin/users/associate cognito_user_pool_id)
export ASSOCIATE_APP_CLIENT_ID=$(terragrunt output            --terragrunt-working-dir $P/admin/users/associate -json cognito_user_pool_client_web|jq '.id')
export ASSOCIATE_IDENTITY_POOL_ID=$(terragrunt output         --terragrunt-working-dir $P/admin/users/associate -json cognito_identity_pool|jq '.id')
export ASSOCIATE_URL=$(printf '"%s%s/"'  $(terragrunt output  --terragrunt-working-dir $P/api/associate -json aws_api_gateway_deployment_api|jq '.invoke_url'|cut -d '"' -f 2) $STAGE)


envsubst < config.js.template > config.js
cat config.js
