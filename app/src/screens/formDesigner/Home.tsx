import React from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
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
import {
  RootStackScreenProps,
  RootStackParamList,
} from 'utils/formDesigner/navigation'

export default function ({ route, navigation }: RootStackScreenProps<'Home'>) {
  return (
    <DashboardLayout
      title={'Home'}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={false}
      navigation={navigation}
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
        <HStack pt="5" space={3} justifyContent="center">
          <Pressable
            onPress={() => navigation.navigate('FormEditor', route.params)}
          >
            <Center h="80" w="190" bg="primary.600" rounded="md" shadow={3}>
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

          <Pressable
            onPress={() => navigation.navigate('FormList', route.params)}
          >
            <Center h="80" w="190" bg="primary.600" rounded="md" shadow={3}>
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
      </VStack>
    </DashboardLayout>
  )
}
