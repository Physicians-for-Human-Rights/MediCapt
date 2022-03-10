import React, { useEffect } from 'react'
import { Box, HStack, Text, VStack, Center } from 'native-base'
import { FormType } from 'utils/types/form'
import yaml from 'js-yaml'
import { useWindowDimensions } from 'react-native'
import useDebounce from 'react-use/lib/useDebounce'
import { Platform } from 'react-native'
import Form from 'components/Form'
// @ts-ignore typescript doesn't support .web.js and .native.js files
import CodeEditor from './CodeEditor'

const FormMemo = React.memo(Form)

export default function FormEditor({
  files,
  form,
  setForm,
  onCancel,
}: {
  files: Record<string, any>
  form: FormType
  setForm: React.Dispatch<React.SetStateAction<FormType>>
  onCancel: () => any
}) {
  const [contents, setContents] = React.useState(yaml.dump(form))
  useEffect(() => {
    try {
      setForm(yaml.load(contents) as FormType)
    } catch (e) {
      // TODO Error handling
      console.log(e)
    }
  }, [contents])

  const window = useWindowDimensions()
  const padding = Platform.OS === 'web' ? 0.03 : 0
  const ratio = Platform.OS === 'web' ? (window.width > 1000 ? 0.6 : 0.45) : 0

  const [rawContents, setRawContents] = React.useState(contents)
  useDebounce(
    () => {
      setContents(rawContents)
    },
    1000,
    [rawContents]
  )

  return (
    <VStack>
      {Platform.OS !== 'web' ? (
        <Center py={2}>
          <Text>Preview: Editing is web-only</Text>
        </Center>
      ) : null}
      <HStack pt="0" space={3} justifyContent="center">
        <CodeEditor
          ratio={ratio}
          contents={contents}
          window={window}
          setRawContents={setRawContents}
        />
        <Box
          h={Math.round(window.height * 0.85) + 'px'}
          w={Math.round(window.width * (1 - ratio - padding)) + 'px'}
        >
          <FormMemo
            files={files}
            form={form}
            noRenderCache={true}
            onCancel={onCancel}
          />
        </Box>
      </HStack>
    </VStack>
  )
}
