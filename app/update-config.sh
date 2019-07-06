#!/bin/bash

export STAGE=prod

export REGION=$(terragrunt output --terragrunt-working-dir medicapt-infrastructure/live/$STAGE/storage/s3/s3-deidentified -json s3_bucket|jq '.region')
export USER_POOL_ID=$(terragrunt output --terragrunt-working-dir medicapt-infrastructure/live/$STAGE/admin/users-providers -json cognito_user_pool_main|jq '.id')
export APP_CLIENT_ID=$(terragrunt output --terragrunt-working-dir medicapt-infrastructure/live/$STAGE/admin/users-providers -json cognito_user_pool_client_web|jq '.id')
export IDENTITY_POOL_ID=$(terragrunt output --terragrunt-working-dir medicapt-infrastructure/live/$STAGE/admin/users-providers -json cognito_identity_pool_main|jq '.id')
export RECORDS_URL=$(terragrunt output --terragrunt-working-dir medicapt-infrastructure/live/$STAGE/api/records -json aws_api_gateway_deployment_api|jq '.invoke_url')

envsubst < config.js.template > medicaptApp/config.js
