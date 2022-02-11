import React from 'react'
import {
  Box,
  VStack,
  StatusBar,
  ScrollView,
  HStack,
  Pressable,
  Icon,
  Image,
  Text,
  Hidden,
  useColorMode,
  IconButton,
  Divider,
  Menu,
  Avatar,
  Button,
  Input,
} from 'native-base'

import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'

import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr_small.png'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export function Sidebar() {
  const list = [
    {
      iconName: 'person-outline',
      iconText: 'Contacts',
    },
    {
      iconName: 'groups',
      iconText: 'Group',
    },
    {
      iconName: 'notifications-none',
      iconText: 'Notification',
    },
    {
      iconName: 'shopping-bag',
      iconText: 'Orders',
    },
    {
      iconName: 'settings',
      iconText: 'Settings',
      iconColorLight: 'primary.900',
      textColorLight: 'primary.900',
    },
    {
      iconName: 'shield',
      iconText: 'Privacy Policy',
    },
    {
      iconName: 'support-agent',
      iconText: 'Help & Support',
    },
    {
      iconName: 'share',
      iconText: 'Refer & Earn',
    },
  ] as any
  return (
    <Box
      w="80"
      borderRightWidth="1"
      display="flex"
      _light={{ bg: 'white', borderRightColor: 'coolGray.200' }}
    >
      <ScrollView>
        <VStack
          pb="4"
          mt="10"
          space="3"
          alignItems="center"
          borderBottomWidth="1"
          _light={{
            borderBottomColor: 'coolGray.200',
          }}
        >
          <Avatar
            source={medicapt_logo}
            width={{ base: 20, md: 40 }}
            height={{ base: 20, md: 40 }}
          />
          <HStack alignItems="center" justifyContent="center" space="2">
            <Text
              fontSize="xl"
              fontWeight="bold"
              _light={{ color: 'coolGray.800' }}
            >
              Jane Doe
            </Text>
          </HStack>
          <Text
            fontSize="md"
            fontWeight="medium"
            textAlign="center"
            _light={{ color: 'coolGray.500' }}
          >
            janedoe2@mydomain.com
          </Text>
        </VStack>
        <VStack px="4" py="4">
          {list.map((item: any, idx: number) => {
            return (
              <Button
                key={idx}
                variant="ghost"
                justifyContent="flex-start"
                py="4"
                px="5"
              >
                <HStack space="4" alignItems="center">
                  <Icon
                    size="6"
                    as={MaterialIcons}
                    name={item.iconName}
                    _light={{ color: 'coolGray.500' }}
                  />
                  <Text
                    fontSize="md"
                    fontWeight="medium"
                    _light={{ color: 'coolGray.800' }}
                  >
                    {item.iconText}
                  </Text>
                </HStack>
              </Button>
            )
          })}
        </VStack>
        <Divider />
        <Box px="4" py="2">
          <Button variant="ghost" justifyContent="flex-start" py="4" px="5">
            <HStack space="4" alignItems="center">
              <Icon
                size="6"
                as={MaterialIcons}
                name="exit-to-app"
                _light={{ color: 'coolGray.500' }}
              />
              <Text
                fontSize="md"
                fontWeight="medium"
                _light={{ color: 'coolGray.800' }}
              >
                Logout
              </Text>
            </HStack>
          </Button>
        </Box>
      </ScrollView>
    </Box>
  )
}

export function Header(props: any) {
  const { colorMode } = useColorMode()
  return (
    <Box
      px="6"
      pt="3"
      pb="3"
      borderBottomWidth="1"
      _light={{
        bg: { base: 'primary.900', md: 'white' },
        borderColor: 'coolGray.200',
      }}
    >
      <VStack
        alignSelf="center"
        width="100%"
        maxW={props.menuButton ? null : '1016px'}
      >
        <HStack alignItems="center" justifyContent="space-between">
          <HStack space="4" alignItems="center">
            {props.menuButton && (
              <IconButton
                variant="ghost"
                colorScheme="light"
                onPress={props.toggleSidebar}
                icon={
                  <Icon
                    size="6"
                    name="menu-sharp"
                    as={Ionicons}
                    _light={{ color: 'coolGray.800' }}
                  />
                }
              />
            )}
            <Image
              h="10"
              w={10}
              alt="NativeBase Startup+"
              resizeMode="cover"
              source={medicapt_logo}
            />
          </HStack>
          {props.searchbar && (
            <Input
              px="4"
              w="30%"
              size="sm"
              placeholder="Search"
              InputLeftElement={
                <Icon
                  px="2"
                  size="4"
                  name={'search'}
                  as={FontAwesome}
                  _light={{
                    color: 'coolGray.400',
                  }}
                />
              }
            />
          )}

          <HStack space="2" alignItems="center">
            <IconButton
              variant="ghost"
              colorScheme="light"
              icon={
                <Icon
                  size="6"
                  name="lock"
                  as={MaterialIcons}
                  _light={{
                    color: 'coolGray.400',
                  }}
                />
              }
            />
            <Menu
              closeOnSelect={false}
              w="200"
              placement="bottom right"
              onOpen={() => console.log('opened')}
              onClose={() => console.log('closed')}
              trigger={triggerProps => {
                return (
                  <IconButton
                    {...triggerProps}
                    variant="ghost"
                    colorScheme="light"
                    icon={<Avatar w="8" h="8" source={phr_logo} />}
                  />
                )
              }}
            >
              <Menu.Group title="Profile">
                <Menu.Item>Account</Menu.Item>
              </Menu.Group>
              <Divider mt="3" w="100%" />
              <Menu.Group title="Shortcuts">
                <Menu.Item>Settings</Menu.Item>
                <Menu.Item>Logout</Menu.Item>
              </Menu.Group>
            </Menu>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}

function MainContent(props: any) {
  return (
    <VStack maxW="1016px" flex={1} width="100%">
      {props.displayScreenTitle && (
        <Hidden till="md">
          <HStack mb="4" space={2} alignItems="center">
            <Pressable>
              <Icon
                size="6"
                as={AntDesign}
                name={'arrowleft'}
                _light={{ color: 'coolGray.800' }}
              />
            </Pressable>
            <Text fontSize="lg" _light={{ color: 'coolGray.800' }}>
              {props.title}
            </Text>
          </HStack>
        </Hidden>
      )}
      {props.children}
    </VStack>
  )
}

export function MobileHeader({ title, backButton, navigation }: any) {
  return (
    <Box
      px="1"
      pt="4"
      pb="4"
      _light={{
        bg: { base: 'primary.900', md: 'white' },
        borderColor: 'coolGray.200',
      }}
    >
      <HStack space="2" justifyContent="space-between">
        <HStack
          flex="1"
          space="2"
          justifyContent="space-between"
          alignItems="center"
        >
          <>
            <HStack alignItems="center" space="1">
              {backButton ? (
                <IconButton
                  variant="ghost"
                  colorScheme="light"
                  onPress={() => navigation.goBack()}
                  icon={
                    <Icon
                      size="6"
                      as={AntDesign}
                      name="arrowleft"
                      color="coolGray.50"
                    />
                  }
                />
              ) : (
                <Box w={10} />
              )}

              <Text color="coolGray.50" fontSize="lg">
                {title}
              </Text>
            </HStack>
            <HStack space="1">
              <IconButton
                variant="ghost"
                colorScheme="light"
                icon={
                  <Icon
                    size="6"
                    name="lock"
                    as={MaterialIcons}
                    _light={{
                      color: 'coolGray.50',
                    }}
                  />
                }
              />
              <Menu
                w="150"
                trigger={triggerProps => {
                  return (
                    <IconButton
                      variant="ghost"
                      colorScheme="light"
                      accessibilityLabel="More options menu"
                      {...triggerProps}
                      icon={
                        <Icon
                          size="6"
                          color="coolGray.50"
                          name={'dots-vertical'}
                          as={MaterialCommunityIcons}
                        />
                      }
                    />
                  )
                }}
                placement="bottom right"
              >
                <Menu.Item>Log out</Menu.Item>
                <Menu.Item>Settings</Menu.Item>
              </Menu>
            </HStack>
          </>
        </HStack>
      </HStack>
    </Box>
  )
}

export default function DashboardLayout({
  navigation,
  scrollable = true,
  displayScreenTitle = true,
  displaySidebar = true,
  searchbar = false,
  backButton = true,
  ...props
}: any) {
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(true)
  function toggleSidebar() {
    setIsSidebarVisible(!isSidebarVisible)
  }

  return (
    <>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />
      <Box safeAreaTop _light={{ bg: 'primary.900' }} />
      <VStack flex={1} bg="muted.50">
        <KeyboardAwareScrollView
          contentContainerStyle={{ width: '100%', height: '100%' }}
        >
          <Hidden from="md">
            <MobileHeader
              title={props.title}
              backButton={backButton}
              navigation={navigation}
            />
          </Hidden>
          <Hidden till="md">
            <Header
              toggleSidebar={toggleSidebar}
              title={props.title}
              menuButton={displaySidebar}
              searchbar={searchbar}
            />
          </Hidden>

          <Box
            flex={1}
            safeAreaBottom
            flexDirection={{ base: 'column', md: 'row' }}
            borderTopColor="coolGray.200"
          >
            {isSidebarVisible && displaySidebar && (
              <Hidden till="md">
                <Sidebar />
              </Hidden>
            )}

            <Hidden till="md">
              <ScrollView
                flex={1}
                p={{ md: 8 }}
                contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
              >
                <MainContent
                  {...props}
                  displayScreenTitle={displayScreenTitle}
                />
              </ScrollView>
            </Hidden>

            <Hidden from="md">
              <MainContent {...props} displayScreenTitle={displayScreenTitle} />
            </Hidden>
          </Box>
        </KeyboardAwareScrollView>
      </VStack>
    </>
  )
}
