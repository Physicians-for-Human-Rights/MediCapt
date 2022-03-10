Locations
=========

A location is some logical entity defined in MediCapt.

|Attribute                                  | Description                                                                                | Required
|-------------------------------------------|--------------------------------------------------------------------------------------------|----------
|`locationUUID`                             | A random v4 UUID                                                                           | Y
|`locationID`                               | A random human understandable ID                                                           | Y
|`country`                                  | The two letter ISO country code                                                            | Y
|`lanugage`                                 | Two letter lanugage code ISO 639-1 lanugage codes                                          | Y
|`legalName`                               | The name of the form that providers will see                                               | Y
|`shortName`                               | The name of the form that providers will see                                               | Y
|`entityType`                              | The subtitle, can be empty                                                                 | N
|`mailingAddress`                          | When the form was entered into the system                                                  | Y
|`coordinates`                              | GPS coordinates                                                                            | Y
|`phoneNumber`                             | When the form was entered into the system                                                  | Y
|`email`                                    | When the form was entered into the system                                                  | Y
|`createdDate`                              | When the form was officially created                                                       | Y
|`createdByUUID`                            | The person who created this form                                                           | Y
|`lastApprovedByUUID`                       | The person who approved this form                                                          | Y
|`enabled`                                  | A number, 1 is enabled, 0 is diabled                                                       | Y
|`enabledDate`                              | A number, 1 is enabled, 0 is diabled                                                       | Y
|`enabledSetByUUID`                         | The person who approved this form                                                          | Y
|`tags`                                     | A tag to help organize forms, tags are always in English and will be translated            | Y
|`version`                                  | A version that describes how this form is laid out                                         | Y
|`locationStorageVersion`                   | A version that describes how this form is laid out                                         | Y

entity_type consists of a comma separated list of tags such as:
  - medical-facility
  - police-station
  - refugee-camp

Tags are always in English but the rendered text will be localized. An UI to
enter new locations will be available to administrator user managers.
