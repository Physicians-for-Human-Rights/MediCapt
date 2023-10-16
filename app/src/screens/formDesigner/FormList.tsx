import React, { useState, useEffect } from 'react'
import {
  AntDesign,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import _ from 'lodash'
import FormSearch from 'components/FormSearch'
import { FormMetadata } from 'utils/types/formMetadata'
import { useInfo, handleStandardErrors } from 'utils/errors'
import { findForms } from 'api/formdesigner'
import Loading from 'components/Loading'

export default function FormList({ route, navigation }: any) {
  return (
    <DashboardLayout
      navigation={navigation}
      displaySidebar={false}
      displayScreenTitle={false}
      title="Select a form"
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
