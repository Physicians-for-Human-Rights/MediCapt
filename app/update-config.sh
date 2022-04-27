#!/bin/bash

export STAGE=dev
export REGION=us-east-1
export P=../medicapt-infrastructure/$STAGE/$REGION

echo $P/admin/users/provider

export PROVIDER_USER_POOL_ID=$(terragrunt output              --terragrunt-working-dir $P/admin/users/provider cognito_user_pool_id)
export PROVIDER_APP_CLIENT_ID=$(terragrunt output             --terragrunt-working-dir $P/admin/users/provider -json cognito_user_pool_client_web|jq '.id')
export PROVIDER_IDENTITY_POOL_ID=$(terragrunt output          --terragrunt-working-dir $P/admin/users/provider -json cognito_identity_pool|jq '.id')
export PROVIDER_URL=$(terragrunt output   --terragrunt-working-dir $P/api/provider -json aws_api_gateway_domain_name_id|cut -d '"' -f 2)

export ASSOCIATE_USER_POOL_ID=$(terragrunt output             --terragrunt-working-dir $P/admin/users/associate cognito_user_pool_id)
export ASSOCIATE_APP_CLIENT_ID=$(terragrunt output            --terragrunt-working-dir $P/admin/users/associate -json cognito_user_pool_client_web|jq '.id')
export ASSOCIATE_IDENTITY_POOL_ID=$(terragrunt output         --terragrunt-working-dir $P/admin/users/associate -json cognito_identity_pool|jq '.id')
export ASSOCIATE_URL=$(terragrunt output   --terragrunt-working-dir $P/api/associate -json aws_api_gateway_domain_name_id|cut -d '"' -f 2)

export FORMDESIGNER_USER_POOL_ID=$(terragrunt output             --terragrunt-working-dir $P/admin/users/formdesigner cognito_user_pool_id)
export FORMDESIGNER_APP_CLIENT_ID=$(terragrunt output            --terragrunt-working-dir $P/admin/users/formdesigner -json cognito_user_pool_client_web|jq '.id')
export FORMDESIGNER_IDENTITY_POOL_ID=$(terragrunt output         --terragrunt-working-dir $P/admin/users/formdesigner -json cognito_identity_pool|jq '.id')
export FORMDESIGNER_URL=$(terragrunt output   --terragrunt-working-dir $P/api/formdesigner -json aws_api_gateway_domain_name_id|cut -d '"' -f 2)

export RESEARCHER_USER_POOL_ID=$(terragrunt output             --terragrunt-working-dir $P/admin/users/researcher cognito_user_pool_id)
export RESEARCHER_APP_CLIENT_ID=$(terragrunt output            --terragrunt-working-dir $P/admin/users/researcher -json cognito_user_pool_client_web|jq '.id')
export RESEARCHER_IDENTITY_POOL_ID=$(terragrunt output         --terragrunt-working-dir $P/admin/users/researcher -json cognito_identity_pool|jq '.id')
# TODO This API doesn't exist yet
#export RESEARCHER_URL=$(terragrunt output   --terragrunt-working-dir $P/api/researcher -json aws_api_gateway_domain_name_id|cut -d '"' -f 2)

export MANAGER_USER_POOL_ID=$(terragrunt output             --terragrunt-working-dir $P/admin/users/manager cognito_user_pool_id)
export MANAGER_APP_CLIENT_ID=$(terragrunt output            --terragrunt-working-dir $P/admin/users/manager -json cognito_user_pool_client_web|jq '.id')
export MANAGER_IDENTITY_POOL_ID=$(terragrunt output         --terragrunt-working-dir $P/admin/users/manager -json cognito_identity_pool|jq '.id')
export MANAGER_URL=$(terragrunt output   --terragrunt-working-dir $P/api/manager -json aws_api_gateway_domain_name_id|cut -d '"' -f 2)


envsubst < config.js.template > config.js
cat config.js
