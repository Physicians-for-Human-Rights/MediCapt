import React from 'react'
import { HStack, VStack, Button, Badge, View } from 'native-base'
import { FormType } from 'utils/formTypes'
import FloatingLabelInput from 'components/FloatingLabelInput'
import NecessaryItem from 'components/NecessaryItem'

export default function FormEditorOverview({
  files,
  form,
  setForm,
}: {
  files: Record<string, any>
  form: FormType
  setForm: React.Dispatch<React.SetStateAction<FormType>>
}) {
  return (
    <VStack>
      <FloatingLabelInput label={'Form name'} />
      <HStack alignItems="center" justifyContent="space-between">
        <FloatingLabelInput
          label={'Form ID (automatically created)'}
          w="100%"
          containerW="45%"
          isReadOnly
          placeholder="Not yet created"
        />
        <FloatingLabelInput
          isReadOnly
          label={'Last edited on (automatic)'}
          placeholder="January 19 2021"
          w="100%"
          containerW="45%"
        />
      </HStack>
      <HStack alignItems="center" justifyContent="space-between">
        <FloatingLabelInput
          label={'From version (automatic)'}
          w="100%"
          containerW="45%"
          isReadOnly
          placeholder="5"
        />
        <View w="45%">
          <NecessaryItem
            isDone={false}
            todoText="Form is not available"
            doneText="Form is being filled out"
            size={4}
          />
        </View>
      </HStack>
      <HStack mt={5} justifyContent="space-between">
        <Button>Publish form</Button>
        <Button>Delete form</Button>
        <Button>Disable form</Button>
      </HStack>
      <VStack mt={10} space={3}>
        <Badge
          variant="solid"
          bg="coolGray.400"
          alignSelf="flex-start"
          _text={{
            color: 'coolGray.50',
            fontWeight: 'bold',
            fontSize: 'xs',
          }}
        >
          FORM CREATION CHECKLIST
        </Badge>
        <NecessaryItem
          isDone={false}
          todoText="No PDF uploaded"
          doneText="Proper pdf uploaded"
          size={4}
        />
        <NecessaryItem
          isDone={false}
          todoText="Using images that aren't uploaded"
          doneText="All referenced images exist"
          size={4}
        />
        <NecessaryItem
          isDone={false}
          todoText="Errors in the form definition"
          doneText="Form definition is valid"
          size={4}
        />
        <NecessaryItem
          isDone={false}
          todoText="Some parts of the PDF not filled out"
          doneText="All PDF fields covered"
          size={4}
        />
      </VStack>
    </VStack>
  )
}
