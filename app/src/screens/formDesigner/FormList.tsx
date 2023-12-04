import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import FormSearch from 'components/FormSearch'
import { useStoreState } from 'utils/store'

export default function FormList({ route, navigation }: any) {
  const state = useStoreState()
  const i18n = state?.i18n
  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title={i18n.t('form.select-form')}
    >
      <FormSearch
        selectItem={formMetadata => {
          navigation.navigate('FormEditor', {
            ...route.params,
            formMetadata,
          })
        }}
      />
    </DashboardLayout>
  )
}
