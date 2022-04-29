import React from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import { default as RecordListComponent } from 'components/RecordList'
import { RecordMetadata } from 'utils/types/record'

const records: RecordMetadata[] = [
  // @ts-ignore This is temporray anyway
  {
    recordID: 'MR3-LUK-9CD-FTR',
    locationUUID: '92cbcf9b-7e93-4726-9778-ef3ecb2a5728',
    formName: 'Post-rape care form',
    formTags: 'sexual-assault',
    completed: false,
    completedDate: null,
    providerCreatedUUID: '64af5d65-34d0-43a1-aaa5-60779b829809',
    providerCompletedUUID: '64af5d65-34d0-43a1-aaa5-60779b829809',
    lastChangedDate: new Date('2020-09-06T10:10:10.000Z'),
    patientName: 'ZackLongname Mylongname LongernameJensen',
    patientGender: 'transgender',
    patientAge: '22',
  },
  // @ts-ignore This is temporray anyway
  {
    recordID: 'MR4-XUP-6CK-9ZF-XYZ',
    locationUUID: '92cbcf9b-7e93-4726-9778-ef3ecb2a5728',
    formName: 'Post-rape care form',
    formTags: 'sexual-assault',
    completed: false,
    completedDate: null,
    providerCreatedUUID: '64af5d65-34d0-43a1-aaa5-60779b829809',
    providerCompletedUUID: '64af5d65-34d0-43a1-aaa5-60779b829809',
    lastChangedDate: new Date('2021-05-21T10:10:10.000Z'),
    patientName: 'Lucca Leon',
    patientGender: 'female',
    patientAge: '52',
  },
  // @ts-ignore This is temporray anyway
  {
    recordID: 'MR3-HP8-34X-UEQ',
    locationUUID: '92cbcf9b-7e93-4726-9778-ef3ecb2a5728',
    formName: 'Post-rape care form',
    formTags: 'sexual-assault',
    completed: true,
    completedDate: new Date('2019-01-01T10:10:10.000Z'),
    providerCreatedUUID: '64af5d65-34d0-43a1-aaa5-60779b829809',
    providerCompletedUUID: '64af5d65-34d0-43a1-aaa5-60779b829809',
    lastChangedDate: new Date('2019-01-11T10:10:10.000Z'),
    patientName: 'Keir Murphy',
    patientGender: 'male',
    patientAge: '32',
  },
]

export default function FormList({ route, navigation }: any) {
  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Find a record"
    >
      <RecordListComponent records={records} />
    </DashboardLayout>
  )
}
