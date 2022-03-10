# Medicapt backend infrastructure

![](https://github.com/abarbu/medicapt-infrastructure/blob/master/docs/backend-overview-v5.png)
    

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

## Updating public access

`TODO Do this automatically`

You should enable block public access to

`medicapt-terraform-state-dev`
`medicapt-terraform-state-logs-dev`

## Localstack

The localstack stage is configured to run with https://localstack.cloud/ You
need localstack Pro and an API key. Put the key in
`localstack/localstack-secrets.env` as in `LOCALSTACK_API_KEY=<API_KEY>`

Run with `start-localstack.sh` This requires `docker`.

As the name implies, this is totally local and will not use your AWS credentials
at all. If you want `aws` to talk to localstack, it's best to use `awslocal`
with `pip install awscli-local`. That way you don't need to set up the endpoint.

When getting set up with localstack it's a good idea to comment out your
`~/.aws/credentials` file temporarily as one of the most common issues are
requests going to Amazon rather than localhost.

## Running the test suite

### Unit tests

Unit tests are run with localstack. In `localstack/tests/unit` run `yarn
install` followed by `yarn test` or `yarn test-watch`, use the latter if you're
developing new tests on the fly.

You can also run `npx majestic` in `localstack/tests/unit`, select start and
start watching from the UI. This will give you a nice browser-based UI.

### Integration tests TODO

Integration tests run on both localstack and dev.

## Common build problems

### `.js` files are being built in the wrong location

`tsc` has an issue where it only builds the shortest path it can in
`dist-lambda/`. There doesn't seem to be a way to disable this
behavior. Instead, just create a `.ts` file at the same depth in a different
directory tree and it will build in the full path.

### Deploying to localstack complains about keys or authorization

Your service is trying to talk to AWS instead of localstack. If you are adding a
new service we have never used before, you may need to figure its endpoint in
`localstack/terragrunt.hcl`

### I want to run terragrunt for an entire stage

You can only run terragrunt for all deployments in a region. To do so run
commands like this for your stage

`terragrunt graph-dependencies --terragrunt-working-dir us-east-1` 

or

`terragrunt run-all init --terragrunt-working-dir us-east-1`

and

`terragrunt run-all plan --terragrunt-working-dir us-east-1`

Ignore the errors about having no outputs when doing `run-all init`.

### Localstack can be slow

Checking if resources exists can be slow in localstack for some reason. You can
skip this step with: `terragrunt apply -auto-approve -refresh=false`

