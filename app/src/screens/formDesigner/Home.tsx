import React from 'react'
import {
  Box,
  HStack,
  Icon,
  VStack,
  Center,
  Button,
  Pressable,
  Divider,
  Hidden,
  Square,
  Circle,
  theme,
} from 'native-base'
import { Text, useStyleSheet } from '@ui-kitten/components'
import { MaterialIcons } from '@expo/vector-icons'
import DashboardLayout from 'components/DashboardLayout'
import {
  RootStackScreenProps,
  RootStackParamList,
} from 'utils/formDesigner/navigation'
import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)

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
        borderColor="coolGray.200"
        bg="white"
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
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.fontSizeLg,
                    { color: 'white' },
                  ]}
                >
                  Create a new form
                </Text>
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
                <Text
                  style={
                    (styleS.fontBold, styleS.fontSizeLg, { color: 'white' })
                  }
                >
                  Edit an existing form
                </Text>
              </VStack>
            </Center>
          </Pressable>
        </HStack>
      </VStack>
    </DashboardLayout>
  )
}
