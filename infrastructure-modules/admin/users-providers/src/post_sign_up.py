import os
import os.path
import sys

import boto3
print(boto3.__version__)

import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

db_name = os.environ['DATABASE_NAME']
db_cluster_arn = os.environ['DB_CLUSTER_ARN']
db_secret_arn = os.environ['DB_PASSWORD_ARN']

rds_client = boto3.client('rds-data')

def handler(event, context):
    logger.info(event)
    # TODO What would reasonable error handling be here? Cognito already made
    # the account, if this is missing from the table what can we do about it?
    rds_client.execute_statement(
        secretArn=db_secret_arn,
        resourceArn=db_cluster_arn,
        database=db_name,
        sql="UPDATE pending_provider_singup SET signed_up = TRUE WHERE email = :email",
        parameters=[{'name':'email',
                     'value':{'stringValue':
                              event['request']['userAttributes']['email']}}])
    return event
