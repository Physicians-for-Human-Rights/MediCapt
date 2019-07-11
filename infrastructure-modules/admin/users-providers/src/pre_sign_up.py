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
    logger.info('## ENVIRONMENT VARIABLES')
    logger.info(os.environ)
    logger.info('## EVENT')
    logger.info(event)
    logger.info(event['request']['userAttributes']['email'])
    response = rds_client.execute_statement(
        secretArn=db_secret_arn,
        resourceArn=db_cluster_arn,
        database=db_name,
        sql="SELECT COUNT(*) FROM provider WHERE email = :email",
        parameters=[{'name':'email', 'value':{'stringValue': 'andrei@0xab.com'}}])
    if response['records'][0][0]['longValue'] > 0:
        raise Exception('A user with this email already exists')
    response = rds_client.execute_statement(
        secretArn=db_secret_arn,
        resourceArn=db_cluster_arn,
        database=db_name,
        sql="SELECT * FROM pending_provider_singup WHERE email = :email",
        parameters=[{'name':'email',
                     'value':{'stringValue':
                              event['request']['userAttributes']['email']}}])
    if len(response['records']) < 1:
        raise Exception('You are not authroized to sign up')
    if len(response['records']) > 2:
        raise Exception('Signup error')
    if response['records'][0][3]['stringValue'] != event['request']['userAttributes']['phone_number']:
        raise Exception('Phone number does not match')
    if response['records'][0][4]['stringValue'] != event['request']['userAttributes']['custom:official_id_number']:
        raise Exception('ID number does not match')
    return event
