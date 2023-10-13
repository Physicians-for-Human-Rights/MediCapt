import React from 'react'
import {
  Box,
  HStack,
  Pressable,
  Icon,
  Button,
  Badge,
  useBreakpointValue,
  FlatList,
  Stack,
} from 'native-base'
import { Text } from '@ui-kitten/components'
import { AntDesign } from '@expo/vector-icons'
import _ from 'lodash'
import { NamedFormSection } from 'utils/types/formHelpers'
import FormButtons from 'components/FormButtons'

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
  return (
    <Pressable
      onPress={() => {
        changeSection(sectionIndex)
        toggleMenu()
      }}
    >
      <Box
        borderBottomWidth="1"
        borderColor="coolGray.200"
        pl="4"
        pr="5"
        py="2"
      >
        <HStack space={3} justifyContent="flex-start">
          <Badge px={2} colorScheme={completed ? 'success' : 'red'}>
            {sectionIndex + 1}
          </Badge>
          <Text status={completed ? 'success' : 'primary'} selectable={false}>
            {title}
          </Text>
        </HStack>
      </Box>
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
