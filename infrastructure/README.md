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

Or for whatever stage (prod, dev, beta, etc.) that you're building.

Modules must be applied in this order due to dependencies:
admin/logging
networking/*
storage/*
admin/users-providers
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
