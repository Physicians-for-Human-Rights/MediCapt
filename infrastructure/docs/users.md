User Management
===============

Users are stored in separate Cognito pools. User identities for every role are
totally unrelated to one another, i.e., one needs a separate login and password
for every role. There is no hierarchical relationship between user roles, each
role has its own separate permissions, no privilege escalation is possible.

There are 5 roles:
 - Providers: Healthcare providers of all types. These users enter records and share them.
 - Associates: Police, lawyers, etc. These users accept shared records.
 - User managers: 
 - Form designers: 
 - Researchers: 

All users have a number of shared required properties:

| Property              | Meaning                                                             |
-----------------------------------------------------------------------------------------------
| `email`               | The user's email address                                            |
| `birthdate`           | Birthdate stored in ISO 8601 date only format                       |
| `name`                | The user's entire name, in the local conventions that the user has  |
| `nickname`            | What the system should call this user                               |
| `gender`              | A string indicating the gender of the user                          |
| `phone_number`        | The user's phone number with international code                     |
| `picture`             | S3 path to the user's photo                                         |
| `official_id_type`    | What type of official ID does this user have                        |
| `official_id_code`    | A local unique identifier on the official id                        |
| `official_id_expires` | When the official id expires                                        |
| `official_id_image`   | S3 path to an image of the official id                              |
| `country`             | The user's preferred country                                        |
| `language`            | The user's preferred language                                       |
| `expiry_date`         | When this user expires                                              |
| `storage_version`     | The storage version of the user, see below                          |

Users are versioned. A user is guaranteed to have storage_version as a
property. Versioning follows semver/semschema rules, same as with records.


