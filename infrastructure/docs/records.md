>Records PHI/PII Design
======================

## Definitions

- PHI/PII: Protected Healthcare Information / Personally Identifiable
  Information specifically that of patients. We do not consider PII/PHI of staff
  here.
- Forms: A form is an empty template which is filled out. It is composed of a
  main body with annexes which can be added later.
- Record: A filled out form. This contains PHI/PII. A record is a collection of
  files (text, images, etc.) that together fill out the form.
- Addendum: A filled out form annex which is attached to a record.
- Location: A logical grouping of people identified by a UUID, as determined by
  user managers. Usually a physical location.

While location are PHI/PII when they are attached to forms, on their own they
are not PHI or PII.

In all cases data (forms, records, locations, users) is referred to by UUID.

## Users

Three kinds of users have access to PHI/PII data:
- Healthcare providers: Physcians, nurses, etc. who enter and review records.
- Associates: 3rd parties (police, etc.) who need access to specific records.
- Researchers: users who have access to statistics about the system and
  patients. A subset of researchers with elevated privildges can unblind data.

All users are authenticated by a user manager. Managers may enter records into
the system, enable or disable users, assign or revoke permissions to specific
locations (limited to those that the manager has access to), and update user
attributes. Minimal data recorded for all users includes: Name, Phone number,
Email address, Physical address, Gender, Date of Birth, Government ID#, Photo of
government ID, Expiration date of government ID. This allows verifying and
tracking users. While sensitive, this data is not patient PHI/PII and is not
discussed further in this document.

### Healthcare providers

Providers have access to all data for all locations that they are registered
with. Providers may review old records. All data access is logged and can be
reviewed through the user manager account.

A provider can be registered in multiple locations. Providers can share data
with one another within location or across locations. When a record is shared
within a location, no additional permissions are given, this is a covenience to
locate records quickly in the UI. When records are shared between providers
across locations, providers will have read-only access through the same
mechanism as associates.

### Associates

Associates have read-only access only to specific records which are shared with
them. All record shares are time-limited, althoug the time bound may be as large
as 5 years, to account for delays in the criminal justice system. Associates may
decline a share or may revoke it. They may access shares as many times as they
wish while they are valid. All accesses are logged and can be reviewed by user
managers.

## Data

PII/PHI exists in three locations:
1. Records DynamoDB - To support looking up records
2. Records S3 bucket - To store records
3. Sharing DynamoDB - To support sharing records and looking up shared records

Related to the security measures listed here, another non-PII/non-PHI storage
mechanism exists: AWS Cognito which stores user information.

### Versioning

The record and sharing storage format is versioned. In what follows describe
version `"1.0.0"`. Note that this is the string "1.0.0" and never a
number. Versioning will follow semver/schemaver rules.

Some invariants will always hold for all future versions. The dynamodb row will
always contain `recordStorageVersion`. The S3 bucket will always contain
`/<recordUUID>/metadata.json` which will always be a map that contains at least
one key `recordStorageVersion`. The same value will always be stored under both
keys.

### 1. Records DynamoDB

This contains metadata about records, enough for healthcare providers to filter
which records they need.

`locationUUID`
`recordUUID`
`createdDate`
`providerCreatedUUID`
`formUUID`
`formTag`
`completed`
`completedDate`
`providerCompletedUUID`
`lastChangeDate`
`patientName`
`patientGender`
`patientAge`
`patientUUID`
`caseId`
`recordStorageVersion`

PatientUUID exists for future compatibility if PHR wants to link together forms
one day.  It is unique per form at the moment.

Global secondary indices:
      (when attributes aren't specified, all attributes are kept)
      (key1 and key2 are the hash and sort keys)

  1. name       : `RecordsByProviderCreated`
     key1       : `providerCreatedUUID`
     key2       : `sharedOnDate`
  2. name       : `RecordsByProviderCompleted`
     key1       : `providerCompletedUUID`
     key2       : `lastChangeDate`
  3. name       : `RecordsByLocation`
     key1       : `locationUUID`
     key2       : `lastChangeDate`

### 2. Records S3 bucket

Records are stored in the following path structure:
`/<recordUUID>/form.json`
`/<recordUUID>/metadata.json`
`/<recordUUID>/image/<imageUUID>.jpg` or `.png`
`/<recordUUID>/addendum/<addendumUUID>.json`

The S3 bucket cannot be listed. There are no delete permissions on the bucket.
The bucket is versioned and encrypted with a CMK.

`metadata.json` describes records. At the moment it consists of only
`{recordStorageVersion: "1.0.0"}`

#### Security controls

Every user is has a field in Cognito which stores a list of locations they may
access. That field is read, compared against the field in the request, if the
request is acceptable then a custom role is created on the fly with the location
tagged as Location. That role is given conditional permissions to access S3 at
paths which are prefixed by that location.

This ensures security in two ways: first, even if the check for the location is
bypassed, the role is only provided access if the right locationUUID is
given. An attacker would have to insert a location UUID into their Cognito
user's tag, in which case they would need to learn that locationUUID.

While the above handles accessing data outside the priviledges that a provider
account has, within location providers must have access to all
records. Providers will be rate-limited and all accesses will be logged. Logs
will be available to user managers.

### 3. Sharing DynamoDB

Share rows will always contain `shareStorageVersion`, starting with the string
`"1.0.0"` in the current version, following the same rules as records.

`sharedWithUUID`
`recordUUID`
`locationUUID`
`formUUID`
`createdDate`
`providerCreateUUID`
`completed`
`completedDate`
`providerCompletedUUID`
`lastChangeDate`
`patientName`
`patientGender`
`patientAge`
`patientUUID`
`sharedOnDate`
`sharedExpiresOnDate`
`sharedByUUID`
`shareStorageVersion`

Global secondary indices:
      (when attributes aren't specified, all attributes are kept)
      (key1 and key2 are the hash and sort keys)

  1. name       : `RecordsSharedByDate`
     key1       : `sharedWithUUID`
     key2       : `sharedOnDate`
  2. name       : `RecordsByOriginAndDate`
     key1       : `sharedByUUID`
     key2       : `sharedOnDate`

Permissions only allow access to rows which start with your own UUID.

Associates can only look up and delete. Providers can only add, look up.

## Researchers

Researchers can only access records through an S3 endpoint with an attached
lambda function that automatically redacts PII/PHI. This function provides a
breakglass mechanism to access deidentified records in extreme circumstances.

Every record has associated with it a unique UUID, its reidentification
UUID. Providing this to the object lambda function avoids the deidentification
procedure and returns the raw record. This results in a notification being sent
to administrators.

The reidentification UUID not available to researchers. It is stored in a
separate S3 bucket which can only be accessed by administrators manually in
extreme circumstances. No automated system reads from this bucket.

An event notification is sent to a lambda function that tags every form.json
file with its unique reidentification UUID and inserts that UUID into the
reidentification S3 bucket automatically for every form upload.


Design Rationale
----------------

Ideally the design would enforce user permissions entirely through AWS IAM
without any code whatsoever. Unfortunately, AWS Organizations and ABAC have a
critical limitation: a user can only be part of a single OU and a tag cannot
contain a list. This essentially means that the OU mechanism and awa:PrincialTag
cannot get the job done.
