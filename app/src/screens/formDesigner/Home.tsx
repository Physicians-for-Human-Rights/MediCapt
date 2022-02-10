import React from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  useColorMode,
  Center,
  Button,
  Pressable,
  Divider,
  Hidden,
  Square,
  Circle,
} from 'native-base'

import { MaterialIcons } from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
function OptionSection(props: any) {
  const [tabName, setTabName] = React.useState('Premium')
  return (
    <HStack pt="5" space={3} justifyContent="center">
      <Pressable onPress={() => console.log("I'm Pressed")}>
        <Center h="80" w="200" bg="danger.600" rounded="md" shadow={3}>
          <VStack space={3}>
            <Center>
              <Icon
                as={<MaterialIcons name="add-box" />}
                color="white"
                size={16}
              />
            </Center>
            <Box
              _text={{
                fontWeight: 'bold',
                fontSize: 'lg',
                color: 'white',
              }}
            >
              Create a new form
            </Box>
          </VStack>
        </Center>
      </Pressable>
      <Pressable onPress={() => console.log("I'm Pressed")}>
        <Center h="80" w="200" bg="danger.600" rounded="md" shadow={3}>
          <VStack space={3}>
            <Center>
              <Icon
                as={<MaterialIcons name="edit" />}
                color="white"
                size={16}
              />
            </Center>
            <Box
              _text={{
                fontWeight: 'bold',
                fontSize: 'lg',
                color: 'white',
              }}
            >
              Edit an existing form
            </Box>
          </VStack>
        </Center>
      </Pressable>
    </HStack>
  )
}

export default function (props: any) {
  const { colorMode } = useColorMode()
  return (
    <DashboardLayout
      title={'Subscription Plans'}
      displaySidebar={false}
      displayScreenTitle={false}
    >
      <VStack
        safeAreaBottom
        height="90%"
        borderRadius={{ md: '8' }}
        _light={{
          borderColor: 'coolGray.200',
          bg: { base: 'white' },
        }}
        px={{
          base: 4,
          md: 32,
        }}
      >
        <OptionSection />
      </VStack>
    </DashboardLayout>
  )
}
