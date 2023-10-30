import React from 'react'
import { useBreakpointValue } from '../hooks/useBreakpointValue'
import { Text, Button, useStyleSheet } from '@ui-kitten/components'
import _ from 'lodash'
import { NamedFormSection } from 'utils/types/formHelpers'
import FormButtons from 'components/FormButtons'
import styles, { layout } from './styles'
import { View, FlatList, Pressable } from 'react-native'
import themedStyles from '../themeStyled'

function Section({
  completed,
  changeSection,
  toggleMenu,
  sectionIndex,
  title,
}: {
  completed: boolean
  changeSection: (s: number) => any
  toggleMenu: () => any
  sectionIndex: number
  title: string
}) {
  const styleS = useStyleSheet(themedStyles)
  return (
    <Pressable
      onPress={() => {
        changeSection(sectionIndex)
        toggleMenu()
      }}
    >
      <View style={styles.formMenuContainer}>
        <View style={[layout.justifyStart, layout.hStackGap3]}>
          <Button status={completed ? 'success' : 'danger'} style={styleS.px2}>
            {sectionIndex + 1}
          </Button>
          <Text status={completed ? 'success' : 'primary'} selectable={false}>
            {title}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

function getKey(_item: any, idx: number) {
  return _.toString(idx)
}

const MSection = React.memo(
  Section,
  (prev, next) => prev.completed === prev.completed && prev.title === prev.title
)

function renderSection({ item, index }: { item: any; index: number }) {
  return (
    <MSection
      completed={item.completed}
      changeSection={item.changeSection}
      toggleMenu={item.toggleMenu}
      sectionIndex={index}
      title={item.title}
    />
  )
}

function FormMenu({
  formSections,
  changeSection,
  isSectionCompleteList,
  toggleMenu,
  onExit,
  onSaveAndExit,
  onSave,
  onCompleteRecord,
  onPrint,
  changed,
  isSealed,
  readOnly,
}: {
  formSections: NamedFormSection[]
  changeSection: (i: number) => any
  isSectionCompleteList: boolean[]
  toggleMenu: () => any
  onExit: () => any
  onSaveAndExit: () => any
  onSave: () => any
  onCompleteRecord: () => any
  onPrint: () => any
  changed: boolean
  isSealed: boolean
  readOnly: boolean
}) {
  const stackDirection = useBreakpointValue({
    base: 'column',
    sm: 'row',
  })
  const data = _.map(formSections, (s: NamedFormSection, index: number) => {
    return {
      completed: isSectionCompleteList[index],
      changeSection,
      toggleMenu: toggleMenu,
      title: s.title,
    }
  })
  return (
    <FlatList
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
        <FormButtons
          isSectionCompleteList={isSectionCompleteList}
          onExit={onExit}
          onSaveAndExit={onSaveAndExit}
          onSave={onSave}
          onCompleteRecord={onCompleteRecord}
          onPrint={onPrint}
          changed={changed}
          isSealed={isSealed}
          readOnly={readOnly}
        />
      }
      data={data}
      renderItem={renderSection}
      keyExtractor={getKey}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
    />
  )
}

const RerenderIfNecessary = React.memo(FormMenu, (prevProps, nextProps) => {
  return (
    prevProps.formSections === nextProps.formSections &&
    _.isEqual(prevProps.isSectionCompleteList, nextProps.isSectionCompleteList)
  )
})

export default RerenderIfNecessary
