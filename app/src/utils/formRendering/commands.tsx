import _ from 'lodash'
import { FormDefinition, FormKVRawType } from 'utils/types/form'
import { mapSectionWithPaths } from 'utils/forms'
import { NamedFormSection } from 'utils/types/formHelpers'
import { FlatRecord, RecordPhoto, RecordValuePath } from 'utils/types/record'
import { getFlatRecordValue } from 'utils/records'
import { t } from 'i18n-js'
import { resolveRef } from 'utils/forms'
import { RenderCommand } from 'utils/formRendering/types'
import { bodyImage } from 'utils/formRendering/utils'
import {
  ManifestFileWithData,
  lookupContentsByNameAndType,
  lookupContentsSHA256,
} from 'utils/manifests'

function isSkipped(flatRecord: FlatRecord, path: RecordValuePath) {
  const prefixes = _.range(0, path.length + 1).map(pathLegth =>
    _.take(path, pathLegth)
  )
  return _.some(
    prefixes,
    prefix => getFlatRecordValue(flatRecord, prefix)?.skipped
  )
}

// Turn a section of a form into a list of flat render commands
export function allFormRenderCommands(
  section: NamedFormSection,
  commonRefTable: Record<string, FormDefinition>,
  contents: ManifestFileWithData[],
  flatRecord: FlatRecord,
  potentialFeilds: boolean = false
) {
  let renderCommands: RenderCommand[] = []
  // any is an ok type here because we're discarding the output
  mapSectionWithPaths<void>(
    section,
    commonRefTable,
    undefined,
    flatRecord,
    {
      pre: (part, recordValuePath, _index, _entry, partOptional) => {
        const recordValue = getFlatRecordValue(flatRecord, recordValuePath)
        const skipped = isSkipped(flatRecord, recordValuePath)
        if (partOptional) {
          renderCommands.push({
            type: 'skip',
            value: recordValue,
            direction: 'row',
            valuePath: recordValuePath,
            key: _.join(recordValuePath.concat('skip'), '.'),
            disable: skipped,
          })
        }
        if ('title' in part) {
          // Look for list-with-parts.<something>
          if (recordValue?.type === 'list-with-parts') {
            renderCommands.push({
              type: 'divider',
              thickness: 1,
              w: '50%',
              valuePath: recordValuePath.concat('divider-pre'),
              key: _.join(recordValuePath.concat('divider-pre'), '.'),
              disable: skipped,
            })
          }
          const isRepeated = 'repeated' in part && part.repeated
          const size = recordValuePath.length < 5 ? 'md' : 'sm'
          const fontWeight = isRepeated
            ? '500'
            : recordValuePath.length < 7
            ? 'bold'
            : 'normal'
          let suffix = ''
          if (isRepeated) {
            const [repeatPathPart, repeatId] = _.takeRight(recordValuePath, 2)
            if (repeatPathPart === 'repeat') {
              const repeatList =
                getFlatRecordValue(
                  flatRecord,
                  _.dropRight(recordValuePath, 2),
                  'repeat-list'
                )?.value ||
                (part.repeated === 'at-least-one' ? ['at-least-one'] : [])
              suffix =
                ' (' +
                t('form.repeat-number') +
                ' ' +
                (_.indexOf(repeatList, repeatId) + 1) +
                ' ' +
                t('form.repeat-out-of') +
                ' ' +
                repeatList.length +
                ')'
            }
          }
          renderCommands.push({
            type: 'title',
            title: 'title' in part ? part.title + suffix : '',
            size,
            fontWeight,
            italic: isRepeated == !undefined,
            valuePath: recordValuePath.concat('title'),
            key: _.join(recordValuePath.concat('title'), '.'),
            disable: skipped,
            originalType: 'type' in part ? part.type : undefined,
          })
        }
        if ('description' in part) {
          renderCommands.push({
            type: 'description',
            description:
              'description' in part && part.description !== undefined
                ? part.description
                : '',
            valuePath: recordValuePath.concat('description'),
            key: _.join(recordValuePath.concat('description'), '.'),
            disable: skipped,
          })
        }
      },
      address: (recordValuePath, part) =>
        renderCommands.push({
          type: 'address',
          recordValue: getFlatRecordValue(
            flatRecord,
            recordValuePath,
            'address'
          ),
          placeholder: part.placeholder,
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
          recordSummary: part['record-summary'],
        }),
      'body-image': (recordValuePath, part) => {
        const genderOrSex: string =
          getFlatRecordValue(flatRecord, ['inferred', 'sex'], 'sex')?.value ||
          getFlatRecordValue(flatRecord, ['inferred', 'gender'], 'gender')
            ?.value ||
          ''
        const recordValue = getFlatRecordValue(
          flatRecord,
          recordValuePath,
          'body-image'
        )

        const image = bodyImage(part, recordValue, contents, genderOrSex)
        const recordPhotosToPhotos = (recordPhotos: RecordPhoto[]) =>
          _.map(recordPhotos, recordPhoto => ({
            'date-taken': recordPhoto['date-taken'],
            uri: lookupContentsSHA256(contents, recordPhoto.sha256) || '',
          }))
        if (image) {
          renderCommands.push({
            type: 'body-image',
            recordValue,
            image,
            imageAnnotations: _.map(
              recordValue?.value.annotations,
              annotation => ({
                ...annotation,
                photos: recordPhotosToPhotos(annotation.photos),
              })
            ),
            valuePath: recordValuePath,
            key: _.join(recordValuePath, '.'),
            disable: isSkipped(flatRecord, recordValuePath),
          })
        } else {
          const mimage = bodyImage(part, recordValue, contents, 'male')
          const fimage = bodyImage(part, recordValue, contents, 'female')
          if (mimage && fimage) {
            renderCommands.push({
              type: 'row',
              valuePath: recordValuePath,
              key: _.join(recordValuePath, '.') + '.row',
              disable: false,
              left: {
                type: 'body-image',
                recordValue,
                image: fimage,
                imageAnnotations: _.map(
                  recordValue?.value.annotations,
                  annotation => ({
                    ...annotation,
                    photos: recordPhotosToPhotos(annotation.photos),
                  })
                ),
                valuePath: recordValuePath,
                key: _.join(recordValuePath, '.') + '.male',
                disable: isSkipped(flatRecord, recordValuePath),
              },
              right: {
                type: 'body-image',
                recordValue,
                image: mimage,
                imageAnnotations: _.map(
                  recordValue?.value.annotations,
                  annotation => ({
                    ...annotation,
                    photos: recordPhotosToPhotos(annotation.photos),
                  })
                ),
                valuePath: recordValuePath,
                key: _.join(recordValuePath, '.') + '.female',
                disable: isSkipped(flatRecord, recordValuePath),
              },
            })
          }
        }
      },
      bool: recordValuePath =>
        renderCommands.push({
          type: 'bool',
          recordValue: getFlatRecordValue(flatRecord, recordValuePath, 'bool'),
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
        }),
      date: (recordValuePath, part) =>
        renderCommands.push({
          type: 'date',
          recordValue: getFlatRecordValue(flatRecord, recordValuePath, 'date'),
          title: part.title,
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
          recordSummary: part['record-summary'],
        }),
      'date-time': (recordValuePath, part) =>
        renderCommands.push({
          type: 'date-time',
          recordValue: getFlatRecordValue(
            flatRecord,
            recordValuePath,
            'date-time'
          ),
          title: part.title,
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
        }),
      email: (recordValuePath, part) =>
        renderCommands.push({
          type: 'email',
          recordValue: getFlatRecordValue(flatRecord, recordValuePath, 'email'),
          placeholder: part.placeholder,
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
          recordSummary: part['record-summary'],
        }),
      gender: (recordValuePath, part) =>
        renderCommands.push({
          type: 'gender',
          recordValue: getFlatRecordValue(
            flatRecord,
            recordValuePath,
            'gender'
          ),
          options: _.fromPairs(
            _.map(
              'gender' in commonRefTable
                ? // TODO Check this at runtime
                  (commonRefTable.gender as Array<FormKVRawType>)
                : [
                    // TODO This is a conservative approach if no gender key is specified
                    // Do we want something else?
                    { key: 'male', value: t('gender.Male') },
                    { key: 'female', value: t('gender.Female') },
                    { key: 'transgender', value: t('gender.Transgender') },
                  ],
              o => [o.value, o.key]
            )
          ) as Record<string, string>,
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
          recordSummary: part['record-summary'],
        }),
      list: (recordValuePath, part) => {
        const listOptions = resolveRef(part.options, commonRefTable)
        if (listOptions) {
          renderCommands.push({
            type: 'list',
            recordValue: getFlatRecordValue(
              flatRecord,
              recordValuePath,
              'list'
            ),
            other: part.other,
            options: listOptions,
            valuePath: recordValuePath,
            key: _.join(recordValuePath, '.'),
            disable: isSkipped(flatRecord, recordValuePath),
          })
        }
      },
      'list-with-labels': (recordValuePath, part) => {
        const listOptions = resolveRef(part.options, commonRefTable)
        if (listOptions) {
          renderCommands.push({
            type: 'list-with-labels',
            recordValue: getFlatRecordValue(
              flatRecord,
              recordValuePath,
              'list-with-labels'
            ),
            other: part.other,
            options: listOptions,
            valuePath: recordValuePath,
            key: _.join(recordValuePath, '.'),
            disable: isSkipped(flatRecord, recordValuePath),
          })
        }
      },
      'list-multiple': (recordValuePath, part) => {
        const listOptions = resolveRef(part.options, commonRefTable)
        if (listOptions) {
          renderCommands.push({
            type: 'list-multiple',
            recordValue: getFlatRecordValue(
              flatRecord,
              recordValuePath,
              'list-multiple'
            ),
            other: part.other,
            options: listOptions,
            valuePath: recordValuePath,
            key: _.join(recordValuePath, '.'),
            disable: isSkipped(flatRecord, recordValuePath),
          })
        }
      },
      'list-with-labels-multiple': (recordValuePath, part) => {
        const listOptions = resolveRef(part.options, commonRefTable)
        if (listOptions) {
          renderCommands.push({
            type: 'list-with-labels-multiple',
            recordValue: getFlatRecordValue(
              flatRecord,
              recordValuePath,
              'list-with-labels-multiple'
            ),
            other: part.other,
            options: listOptions,
            valuePath: recordValuePath,
            key: _.join(recordValuePath, '.'),
            disable: isSkipped(flatRecord, recordValuePath),
          })
        }
      },
      'list-with-parts': (recordValuePath, part) => {
        const listOptions = resolveRef(part.options, commonRefTable)
        if (listOptions) {
          renderCommands.push({
            type: 'list-with-parts',
            recordValue: getFlatRecordValue(
              flatRecord,
              recordValuePath,
              'list-with-parts'
            ),
            options: listOptions,
            valuePath: recordValuePath,
            key: _.join(recordValuePath, '.'),
            disable: isSkipped(flatRecord, recordValuePath),
          })
        }
      },
      'long-text': (recordValuePath, part) =>
        renderCommands.push({
          type: 'long-text',
          recordValue: getFlatRecordValue(
            flatRecord,
            recordValuePath,
            'long-text'
          ),
          numberOfLines:
            part['number-of-lines'] === null ||
            part['number-of-lines'] === undefined
              ? 5
              : part['number-of-lines'],
          placeholder: part.placeholder,
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
        }),
      number: (recordValuePath, part) =>
        renderCommands.push({
          type: 'number',
          recordValue: getFlatRecordValue(
            flatRecord,
            recordValuePath,
            'number'
          ),
          placeholder: part.placeholder,
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
        }),
      'phone-number': (recordValuePath, part) =>
        renderCommands.push({
          type: 'phone-number',
          recordValue: getFlatRecordValue(
            flatRecord,
            recordValuePath,
            'phone-number'
          ),
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
          recordSummary: part['record-summary'],
        }),
      photo: recordValuePath => {
        const recordValue = getFlatRecordValue(
          flatRecord,
          recordValuePath,
          'photo'
        )
        renderCommands.push({
          type: 'photo',
          recordValue,
          photos: _.map(recordValue?.value, recordPhoto => ({
            uri: lookupContentsSHA256(contents, recordPhoto.sha256) || '',
            'date-taken': recordPhoto['date-taken'],
          })),
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
        })
      },
      sex: recordValuePath =>
        renderCommands.push({
          type: 'sex',
          recordValue: getFlatRecordValue(flatRecord, recordValuePath, 'sex'),
          options: _.fromPairs(
            _.map(
              'sex' in commonRefTable
                ? // TODO Check this at runtime
                  (commonRefTable.sex as Array<FormKVRawType>)
                : [
                    // TODO This is a conservative approach if no gender key is specified
                    // Do we want something else?
                    { key: 'male', value: t('sex.Male') },
                    { key: 'female', value: t('sex.Female') },
                    { key: 'trans', value: t('sex.Trans') },
                  ],
              o => [o.value, o.key]
            )
          ) as Record<string, string>,
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
        }),
      signature: recordValuePath => {
        const recordValue = getFlatRecordValue(
          flatRecord,
          recordValuePath,
          'signature'
        )
        renderCommands.push({
          type: 'signature',
          recordValue,
          imageUri:
            recordValue?.value.sha256 &&
            lookupContentsSHA256(contents, recordValue?.value.sha256),
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
        })
      },
      text: (recordValuePath, part) =>
        renderCommands.push({
          type: 'text',
          recordValue: getFlatRecordValue(flatRecord, recordValuePath, 'text'),
          placeholder: part.placeholder,
          valuePath: recordValuePath,
          key: _.join(recordValuePath, '.'),
          disable: isSkipped(flatRecord, recordValuePath),
          recordSummary: part['record-summary'],
        }),
      combineResultsFromParts: () => null,
      combineResultsFromSubparts: () => null,
      post: (_part, _subparts, _inner, recordValuePath) => {
        if (recordValuePath.length === 4) {
          renderCommands.push({
            type: 'divider',
            thickness: 1,
            valuePath: recordValuePath.concat('divider-post'),
            key: _.join(recordValuePath.concat('divider-post'), '.'),
            disable: isSkipped(flatRecord, recordValuePath),
          })
        }
      },
      preRepeat: (part, recordValuePath) => {
        let suffix = ''
        const recordValue = getFlatRecordValue(
          flatRecord,
          recordValuePath,
          'repeat-list'
        )
        if ('repeated' in part && part.repeated) {
          const numberOfRepeats = (
            recordValue?.value ||
            (part.repeated === 'at-least-one' ? ['at-least-one'] : [])
          ).length
          if (numberOfRepeats === 1) {
            suffix = ' (' + t('form.repeated-one-time-below') + ')'
          } else if (numberOfRepeats > 0) {
            suffix =
              ' (' +
              t('form.repeated') +
              ' ' +
              numberOfRepeats +
              ' ' +
              t('form.times-below') +
              ')'
          } else {
            suffix = ' (' + t('form.can-repeat-below') + ')'
          }
        }
        renderCommands.push({
          type: 'title',
          title: 'title' in part ? part.title + suffix : '',
          size: 'sm',
          fontWeight: 'bold',
          italic: false,
          valuePath: recordValuePath.concat('title'),
          key: _.join(recordValuePath.concat('title'), '.'),
          disable: isSkipped(flatRecord, recordValuePath),
        })
      },
      postRepeated: (_results, part, recordValuePath) => {
        if ('repeated' in part && part.repeated) {
          const repeatListRecordValue = getFlatRecordValue(
            flatRecord,
            recordValuePath,
            'repeat-list'
          )
          renderCommands.push({
            type: 'add-repeat-button',
            recordValue: repeatListRecordValue,
            title: 'title' in part ? part.title : '',
            partRepeated: part.repeated,
            valuePath: recordValuePath,
            key: _.join(recordValuePath.concat('add-repeat-button'), '.'),
            disable: isSkipped(flatRecord, recordValuePath),
          })
        }
      },
      preEachRepeat: (part, repeatListRecordPath, repeatId, recordPath) => {
        if (
          'repeated' in part &&
          part.repeated &&
          repeatId !== 'at-least-one'
        ) {
          const repeatListRecordValue = getFlatRecordValue(
            flatRecord,
            repeatListRecordPath,
            'repeat-list'
          )
          renderCommands.push({
            type: 'remove-repeat-button',
            recordValue: repeatListRecordValue,
            title: 'title' in part ? part.title : '',
            partRepeated: part.repeated,
            repeatId: repeatId,
            valuePath: repeatListRecordPath,
            key: _.join(recordPath.concat('add-repeat-button'), '.'),
            disable: isSkipped(flatRecord, repeatListRecordPath),
          })
        }
      },
      eachRepeat: () => {},
    },
    potentialFeilds
  )
  return renderCommands
}
