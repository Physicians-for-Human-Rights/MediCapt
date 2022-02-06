# Medicapt backend infrastructure

Overview of the deign of the app:
https://app.cloudcraft.co/view/259c0a0b-21f3-4565-bf0e-9c5e5ab63e81?key=f99acf58-5ee2-479e-9756-f26006be7e66

## Terraform and terragrunt

You must install terraform and terragrunt.

Get terraform 1.1.3 from here: https://releases.hashicorp.com/terraform/1.1.3/

Get terragrunt 0.35.18 from here: https://github.com/gruntwork-io/terragrunt/raeleases/tag/v0.35.18

## One-time account setup

You only need to do this when deploying to a new AWS account. If the account has
already been set up, move on.

### Domain name

You must have at least one domain name that you registered through Route 52. You
can do this through the console. Record that domain name and its zone id in all
of the stage.hcl files. Stages can share the same domain name, but prod should
have a different domain name!

### IAM users

#### Terraform backend user

Create a new
policy. https://console.aws.amazon.com/iam/home#/policies$new?step=edit Click
JSON and copy in the contents of `terraform-policy.json`. We only give terraform
the specific permissions that it needs. If you add services, you will need to
update this policy.

Call it `${namespace}terraform-policy-${stage}`, i.e. like
`medicapt-terraform-policy-dev`.  Create a new user:
`${namespace}-terraform-user-${stage}` (something like
`medicapt-terraform-user-dev`). Only enable programmatic access. Attach
the policy you just created. Place the user secrets in `~/.aws/credentials` as:

```
[$username]
aws_access_key_id=
aws_secret_access_key=
```

Go to https://console.aws.amazon.com/iam/home click the user you just created,
open them, and fill in the account_id in `stage.hcl`.


#### Updating IAM permissions

If you change the infrastructure, you may have to change IAM
policies. `https://github.com/iann0036/iamlive` listens to terraform's
communication with AWS. Run `iamlive -set-ini` in the background and note which
permissions are being used.

```
export AWS_CSM_ENABLED=true
export AWS_CSM_PORT=31000
export AWS_CSM_HOST=127.0.0.1
```

## Setting up your environment

Regardless of whether you have set up a stage before or not, you must tell the
aws client your secret info.

Put the credentials for your IAM user in ~/.aws/credentials as

```
[default]
aws_access_key_id=
aws_secret_access_key=
```

## One-time stage setup

You only need to do this when deploying a new stage (after the above per-account
setup). If the stage already exists, move on.

### stage.hcl

In the stage directory, you will need to fill in stage.hcl (have a look at the
`dev` stage if you have questions).

The stage name must be unique. You will need some of the info you generated
above.

For the last entry, you need to fill in an account_id. This stage can only run
under that account! This prevents us from making any mistakes where we deploy
the wrong stage to the wrong account. You set up your `aws` credentials above,
now you can run `aws sts get-caller-identity`. The account id (the number under
"Account") will be among the values returned. Fill it in, in stage.hcl.

### One-off stages

If you set `TG_STATE_PREFIX`, it will be prepended to all one-off resources. You
should be able to deploy this stage safely. Although note that you might need a
different domain_name, as the medicapt domains are linked to our accounts.

## Deploying


## Modifying

### Uploading

## Budgeting

You must follow the instructions here and create yourself a web hook.

https://api.slack.com/apps/new

Create an incoming webhook on the next page.
Add new webhooks to workspace

Select which channel you want the webhook to post to and place it in the
`stage.hcl` with key `budget_slack_webhook`

More info about webhooks at: https://api.slack.com/messaging/webhooks


# Manual steps

After creating the user pools, in admin/users, you must go to the console, in
Cognito, click manage identity pools, click edit identity pool (top right),
click authentication providers, Cognito should be the default, and under
"Attributes for access control" select "Use default mappings". Then save.

There doesn't seem to be a way to do this in terraform right now.





AWS config;
  # TODO This assumes we have a us-east-1 deployment
Need to do something about SNS and AWS Config
Note AWS Config recording manually turned off


# Email

New accounts will be in the SES sandbox, unable to send any useful emails.

https://console.aws.amazon.com/ses

# Updating public access

You should enable block public access to

medicapt-terraform-state-dev
medicapt-terraform-state-logs-dev	


Deployments happen region by region:
terragrunt graph-dependencies --terragrunt-working-dir us-east-1


You will need to install terragrunt. Modules contains the raw code, live
contains the runtime info for each stage, right now only prod exists. Note that
paths in the live module can refer to specific git revisions to keep them
stable.

State is stored in S3. Modules have to be deployed in order because of
dependency issues in terraform.

One module is special and must be deployed once per account, it sets up remote
terraform state. modules/global/s3
Deploy it to an account with:

export TF_VAR_bucket_name=medicapt-terraform-state
export TF_VAR_table_table=medicapt-terraform-locks

After this you can switch to live/prod. You will need to select a KMS CMK. For
various reasons you want to make this key by hand and not through terraform. You
need to create the CMK and record its ARN and ID and set these in

export TF_VAR_kms_key_arn=
export TF_VAR_kms_key_id=

We also need to create database passwords, which again shouldn't appear in
terraform state. Go to the AWS Systems Manager, select the Parameter Store and
create three passwords:

medicapt-deidentified-prod-db-password
medicapt-metadata-prod-db-password
medicapt-records-prod-db-password

medicapt-deidentified-dev-db-password
medicapt-metadata-dev-db-password
medicapt-records-dev-db-password

Or for whatever stage (prod, dev, beta, etc.) that you're building.

Modules must be applied in this order due to dependencies:
admin/logging
networking/*
admin/users-providers
storage/*
api/*

* Creating a KMS CMK

aws kms create-key --origin EXTERNAL

Take the key id and put it below:

aws kms get-parameters-for-import --key-id <keyid> --wrapping-algorithm RSAES_OAEP_SHA_256 --wrapping-key-spec RSA_2048
openssl enc -d -base64 -A -in public-key.b64 -out public-key.bin
openssl enc -d -base64 -A -in import-token.b64 -out import-token.bin
openssl rand -out plaintext-key-material.bin 32
openssl pkeyutl \
        -in plaintext-key-material.bin \
        -inkey public-key.bin \
        -out encrypted-key-material.bin \
        -keyform der \
        -pubin -encrypt \
        -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256
aws kms import-key-material --key-id c7ac1c3c-0f32-4e04-acb8-8b7c347717b7 \
                              --encrypted-key-material fileb://encrypted-key-material.bin \
                              --import-token fileb://import-token.bin \
                              --expiration-model KEY_MATERIAL_DOES_NOT_EXPIRE

And you're done.

* Data API

The data API has to be enabled for each database manually. There doesn't seem to
be a way to do it through terraform at the moment.


# Localstack

You need localstack pro and an API key. Put in `localstack-secrets.env`

Runs in its own stage. Run with `start-localstack.sh`
