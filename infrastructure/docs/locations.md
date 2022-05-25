Locations
=========

A location is some logical entity defined in MediCapt. Top is the location
object, bottom are additional fields for storage in DynamoDB.

| Attribute          | Description                                            | Optional? |
|--------------------|--------------------------------------------------------|-----------|
| `locationUUID`     | A random v4 UUID                                       |           |
| `locationID`       | A random human understandable ID                       |           |
| `country`          | The two letter ISO country code                        |           |
| `lanugage`         | Two letter lanugage code ISO 639-1 lanugage codes      |           |
| `legalName`        | The name of the form that providers will see           |           |
| `shortName`        | The name of the form that providers will see           |           |
| `entityType`       | The subtitle, can be empty                             |           |
| `address`          | When the form was entered into the system              |           |
| `mailingAddress`   | When the form was entered into the system              |           |
| `coordinates`      | GPS coordinates                                        |           |
| `phoneNumber`      | When the form was entered into the system              |           |
| `email`            | When the form was entered into the system              |           |
| `createdDate`      | When the form was officially created                   |           |
| `createdByUUID`    | The person who created this location                   |           |
| `enabled`          | A number, 1 is enabled, 0 is diabled                   |           |
| `enabledDate`      | A number, 1 is enabled, 0 is diabled                   |           |
| `enabledSetByUUID` | The person who approved this form                      |           |
| `tags`             | A tag to help organize locations                       |           |
| `version`          | Starts at 1, increments with any changes               |           |
| `storage-version`  | A version that describes how this location is laid out |           |
|--------------------|--------------------------------------------------------|-----------|
| `PK`               | `LOCATION#locationUUID`                                |           |
| `SK`               | A synthetic version number                             |           |
|                    |                                                        |           |
|                    | Look up a location by human ID                         |           |
| `GPK1`             | `LOCATION#locationID` only if latest version           | Y         |
| `GSK1`             | `VERSION#latest`                                       | Y         |
|                    |                                                        |           |
|                    | Find the latest locations                              |           |
| `GPK2`             | `VERSION#latest`                                       | Y         |
| `GSK2`             | `DATE#lastChangedDate`                                 | Y         |
|                    |                                                        |           |
|                    | Find the latest locations by language                  |           |
| `GPK3`             | `LA#language`                                          | Y         |
| `GSK3`             | `DATE#lastChangedDate`                                 | Y         |
|                    |                                                        |           |
|                    | Find the latest locations by country                   |           |
| `GPK4`             | `CA#country` if the appropriate record                 | Y         |
| `GSK4`             | `DATE#lastChangedDate`                                 | Y         |
|                    |                                                        |           |
|                    | Find the latest locations by entity type               |           |
| `GPK5`             | `ET#entityType` if the appropriate record              | Y         |
| `GSK5`             | `DATE#lastChangedDate`                                 | Y         |


`storage-version` describes what kind of object this is. This document describes
`LOCATION#1.0.0`. Standard semver policies apply to this version.

The sort key, `SK`, is a synthetic version: the `version` (a number that
auto-increments) as `VERSION#NR`, `VERSION#latest` or `VERSION#deleted`.

The primary key is `locationUUID` and the sort key is `synthetic-version`. Every
version of every location is stored permanently. There is a copy of the latest
version stored in `synthetic-version` as `version#latest`. This allows for
efficient queries for the latest version, and rollback and full history
support. If a location is deleted, it has no `version#latest` only a
`version#deleted`. We scope versions with `version#` in `synthetic-version` to
allow future extensions to the sort key.

entity_type is one of:
  - medical-facility
  - police-station
  - refugee-camp

Locations access patterns:
- get the latest version of a location by uuid
- get the N latest versions of a location by uuid
- get a location from a human id
- list the newest locations
- list the locations in a country
- list the locations with a language
- list the locations with a specific type

Global indices 1 through 4 are used for searching by language, country, entity
type, and the location ID. Their primary key only includes the latest version of
every location.
