import React from 'react'
import { Input, Center, Checkbox } from 'native-base'
import useDebounce from 'react-use/lib/useDebounce'
import _ from 'lodash'
import { FormPart, FormPartField } from 'utils/formTypes'

export function ListSelectMultiple({
  valuePaths,
  part,
  formPath,
  otherPath,
  otherPathValue,
  getPath,
  setPath,
}: {
  valuePaths: string[]
  formPath: string
  otherPath: string | null
  otherPathValue: string | null
  getPath: any
  setPath: any
  part: FormPart & (FormPartField & { type: 'list'; 'select-multiple': true })
}) {
  const [rawContents, setRawContents] = React.useState(
    getPath(otherPathValue, _.isString, '')
  )
  useDebounce(
    () => {
      setPath(otherPathValue, rawContents)
    },
    300,
    [rawContents]
  )

  if ('select-multiple' in part) {
    const items =
      'options' in part && _.isArray(part.options)
        ? // @ts-ignore TODO type this
          part.options.map((e: string, i: number) => {
            let valuePath = valuePaths[i]
            return (
              <Checkbox
                key={valuePaths[i]}
                colorScheme="blue"
                isChecked={getPath(valuePath, _.isBoolean, false)}
                value={valuePath}
                my={2}
                onChange={state => setPath(valuePath, state)}
              >
                {e}
              </Checkbox>
            )
          })
        : []
    if (part.other && otherPath !== null) {
      items.push(
        <Checkbox
          key={otherPath}
          colorScheme="blue"
          isChecked={getPath(otherPath, _.isBoolean, false)}
          value={otherPath}
          my={2}
          onChange={state => setPath(otherPath, state)}
        >
          Other
        </Checkbox>
      )
    }
    return (
      <Center key={formPath}>
        <Checkbox.Group colorScheme="blue">{items}</Checkbox.Group>
        {getPath(otherPath, _.isBoolean, false) && (
          <Input
            key={items.length}
            w="80%"
            size="md"
            placeholder={'Details about other (optional)'}
            multiline={true}
            numberOfLines={5}
            onChangeText={setRawContents}
            value={rawContents}
          />
        )}
      </Center>
    )
  } else {
    console.log('TODO Handle errors for bad forms')
    return null
  }
}
