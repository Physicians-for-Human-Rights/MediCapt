import React, { useState, useCallback, useEffect } from 'react'
import useMap from 'react-use/lib/useMap'
import usePrevious from 'react-use/lib/usePrevious'
import useSet from 'react-use/lib/useSet'
import useToggle from 'react-use/lib/useToggle'
import {
  Keyboard,
  View,
  // NB Don't use the native-base FlatList. It's buggy!
} from 'react-native'
import _ from 'lodash'
import { useStoreState } from '../utils/store'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import {
  RecordMetadata,
  RecordManifestWithData,
} from 'utils/types/recordMetadata'
import {
  getFormTypeFromManifest,
  getRecordTypeFormManifest,
} from 'utils/manifests'
import formatDate from 'utils/date.ts'
import { getUserByUUIDCached } from 'api/common'
import { userFullName } from 'utils/userTypes'
import { UserType } from 'utils/types/user'
import FormButtons from 'components/FormButtons'
import {
  mkTitle,
  mkText,
  mkLongText,
  mkRecordList,
  mkShareList,
} from 'utils/formRendering/make'
import { Share } from 'utils/types/share'
import { disableRenderCommands } from 'utils/formRendering/utils'
import { layout } from './styles'

const recordOverviewPage = (
  recordMetadataRef: React.MutableRefObject<RecordMetadata | undefined>,
  formMetadata: FormMetadata,
  users: Record<string, Partial<UserType>>,
  isSealed: boolean,
  associatedRecords: RecordMetadata[],
  selectAssociatedRecord: (r: RecordMetadata) => any,
  shares: Share[],
  selectShare: (r: Share) => any
) => {
  const state = useStoreState()
  const i18n = state?.i18n
  return _.concat(
    isSealed
      ? _.concat(
          mkTitle(
            i18n.t('record.overview.record-is-sealed'),
            'stitle',
            '#d5001c'
          ),
          mkText(
            i18n.t('record.overview.sealed-by'),
            recordMetadataRef.current && recordMetadataRef.current.sealedByUUID
              ? userFullName(
                  users[recordMetadataRef.current.sealedByUUID],
                  recordMetadataRef.current.sealedByUUID
                )
              : 'N/A',
            'scby'
          ),
          mkText(
            i18n.t('record.overview.sealed-date'),
            recordMetadataRef.current &&
              recordMetadataRef.current.sealedDate &&
              recordMetadataRef.current.sealedDate > new Date('January 01 1500')
              ? formatDate(recordMetadataRef.current.sealedDate, 'PPP')
              : 'N/A',
            'sldate'
          )
        )
      : [],
    _.isArray(associatedRecords) && associatedRecords.length > 0
      ? mkRecordList(
          'Associated records',
          'artitle',
          associatedRecords,
          selectAssociatedRecord
        )
      : [],
    _.isArray(shares) && shares.length > 0
      ? mkShareList('Record shared with', 'shtitle', shares, selectShare)
      : [],
    mkTitle(i18n.t('record.overview.titles.patient'), 'ptitle'),
    [
      {
        type: 'description',
        // @ts-ignore TODO
        description: i18n.t('record.overview.automatically-filled'),
        key: 'D',
        valuePath: [],
        disable: false,
      },
    ],
    mkText(
      i18n.t('heading.name'),
      recordMetadataRef.current && recordMetadataRef.current.patientName
        ? recordMetadataRef.current.patientName
        : 'N/A',
      'pname'
    ),
    mkText(
      i18n.t('user.gender'),
      recordMetadataRef.current && recordMetadataRef.current.patientGender
        ? i18n.t('gender.' + recordMetadataRef.current.patientGender)
        : 'N/A',
      'pgender'
    ),
    mkLongText(
      i18n.t('user.address'),
      recordMetadataRef.current && recordMetadataRef.current.patientAddress
        ? recordMetadataRef.current.patientAddress
        : 'N/A',
      'paddress',
      2
    ),
    mkText(
      i18n.t('user.date-of-birth'),
      recordMetadataRef.current &&
        recordMetadataRef.current.patientDateOfBirth >
          new Date('January 01 1500')
        ? (formatDate(
            recordMetadataRef.current.patientDateOfBirth,
            'PPP'
          ) as string)
        : 'N/A',
      'pdob'
    ),
    mkText(
      i18n.t('user.phone-number'),
      recordMetadataRef.current && recordMetadataRef.current.patientPhoneNumber
        ? recordMetadataRef.current.patientPhoneNumber
        : 'N/A',
      'pnumber'
    ),
    mkText(
      i18n.t('user.email'),
      recordMetadataRef.current && recordMetadataRef.current.patientEmail
        ? recordMetadataRef.current.patientEmail
        : 'N/A',
      'pemail'
    ),
    mkText(
      i18n.t('record.incident-date'),
      recordMetadataRef.current &&
        recordMetadataRef.current.incidentDate > new Date('January 01 1500')
        ? (formatDate(recordMetadataRef.current.incidentDate, 'PPP') as string)
        : 'N/A',
      'pincidentdate'
    ),
    mkTitle(i18n.t('record.overview.titles.administrative'), 'atitle'),
    mkText(
      i18n.t('record.overview.record-id'),
      recordMetadataRef.current
        ? recordMetadataRef.current.recordID
        : 'Automatic',
      'recordID'
    ),
    mkText(
      i18n.t('record.overview.case-id'),
      recordMetadataRef.current && recordMetadataRef.current.caseId
        ? recordMetadataRef.current.caseId
        : 'N/A',
      'caseID'
    ),
    mkText(
      i18n.t('record.overview.form-title'),
      formMetadata.title,
      'formTitle'
    ),
    mkText(i18n.t('record.overview.form-id'), formMetadata.formID, 'formID'),
    mkText(
      i18n.t('record.overview.form-version'),
      formMetadata.version,
      'formVersion'
    ),
    mkText(
      i18n.t('record.overview.form-name-and-code'),
      formMetadata['official-name'] + '-' + formMetadata['official-code'],
      'formCode'
    ),
    mkTitle(i18n.t('record.overview.titles.timeline'), 'ttitle'),
    mkText(
      i18n.t('record.overview.record-version'),
      recordMetadataRef.current
        ? recordMetadataRef.current.version
        : 'Automatic',
      'recordVersion'
    ),
    mkText(
      i18n.t('record.overview.created-date'),
      recordMetadataRef.current &&
        recordMetadataRef.current.createdDate > new Date('January 01 1500')
        ? (formatDate(recordMetadataRef.current.createdDate, 'PPP') as string)
        : 'N/A',
      'cdate'
    ),
    mkText(
      i18n.t('record.overview.created-by'),
      recordMetadataRef.current && recordMetadataRef.current.createdByUUID
        ? userFullName(
            users[recordMetadataRef.current.createdByUUID],
            recordMetadataRef.current.createdByUUID
          )
        : 'N/A',
      'cby'
    ),
    mkText(
      i18n.t('record.overview.last-changed-date'),
      recordMetadataRef.current &&
        recordMetadataRef.current.lastChangedDate > new Date('January 01 1500')
        ? (formatDate(
            recordMetadataRef.current.lastChangedDate,
            'PPP'
          ) as string)
        : 'N/A',
      'ldate'
    ),
    mkText(
      i18n.t('record.overview.last-changed-by'),
      recordMetadataRef.current && recordMetadataRef.current.lastChangedByUUID
        ? userFullName(
            users[recordMetadataRef.current.lastChangedByUUID],
            recordMetadataRef.current.lastChangedByUUID
          )
        : 'N/A',
      'lby'
    )
  )
}

export default recordOverviewPage
