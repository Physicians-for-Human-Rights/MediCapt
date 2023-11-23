import React, { useState, useEffect } from 'react'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import FormSearch from 'components/FormSearch'
import i18n from 'i18n'

export default function FormList({ route, navigation }: any) {
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
