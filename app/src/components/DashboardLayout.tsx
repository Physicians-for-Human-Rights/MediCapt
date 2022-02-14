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
import { Auth } from 'aws-amplify'

import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr_small.png'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export function Sidebar(signOut) {
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
          <Button
            variant="ghost"
            justifyContent="flex-start"
            py="4"
            px="5"
            onPress={signOut}
          >
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
            {props.backButton ? (
              <IconButton
                onPress={() => props.navigation.goBack()}
                icon={
                  <Icon
                    size="6"
                    as={AntDesign}
                    name="arrowleft"
                    color="coolGray.500"
                  />
                }
              />
            ) : (
              <Box w={10} />
            )}
            <Pressable onPress={() => props.navigation.goBack()}>
              <Image
                h="10"
                w={10}
                alt="NativeBase Startup+"
                resizeMode="cover"
                source={medicapt_logo}
              />
            </Pressable>
            {props.displayHeaderTitle && (
              <Text fontSize="3xl" color="coolGray.500" fontWeight={300}>
                {props.title}
              </Text>
            )}
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

          {props.middlebar}

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
                <Menu.Item>Settings</Menu.Item>
              </Menu.Group>
              <Divider mt="3" w="100%" />
              <Menu.Group title="Shortcuts">
                <Menu.Item>Lock</Menu.Item>
                <Menu.Item onPress={props.signOut}>Log out</Menu.Item>
              </Menu.Group>
            </Menu>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}

// TODO Type this
function MainContent({
  displayScreenTitle,
  title,
  children,
  fullWidth,
}: {
  displayScreenTitle: boolean
  title: string
  children: JSX.Element
  fullWidth: boolean
}) {
  return (
    <VStack maxW={fullWidth ? undefined : '1016px'} flex={1} width="100%">
      {displayScreenTitle && (
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
              {title}
            </Text>
          </HStack>
        </Hidden>
      )}
      {children}
    </VStack>
  )
}

export function MobileHeader({
  title,
  backButton,
  navigation,
  signOut,
  mobileMiddlebar,
  showLogos,
}: {
  title: string
  backButton: boolean
  navigation: any
  signOut: () => any
  mobileMiddlebar: JSX.Element | null
  showLogos: boolean
}) {
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
              ) : showLogos ? (
                <HStack>
                  <Image
                    h="10"
                    w={10}
                    mx={4}
                    alt="MediCapt logo"
                    resizeMode="cover"
                    source={medicapt_logo}
                  />
                  <Image
                    h="10"
                    w={10}
                    mx={4}
                    alt="PHR logo"
                    resizeMode="cover"
                    source={phr_logo}
                  />
                </HStack>
              ) : (
                <Box w={10} />
              )}
              <Text color="coolGray.50" fontSize="lg">
                {title}
              </Text>
            </HStack>
            {mobileMiddlebar}
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
                <Menu.Item>Account</Menu.Item>
                <Menu.Item>Settings</Menu.Item>
                <Divider mt="3" w="100%" />
                <Menu.Item>Lock</Menu.Item>
                <Menu.Item onPress={signOut}>Log out</Menu.Item>
              </Menu>
            </HStack>
          </>
        </HStack>
      </HStack>
    </Box>
  )
}

function authSignOut() {
  Auth.signOut()
}

export default function DashboardLayout({
  navigation,
  children,
  title,
  signOut,
  user,
  scrollable = true,
  displayScreenTitle = true,
  displayHeaderTitle = true,
  displaySidebar = true,
  searchbar = false,
  backButton = true,
  middlebar = null,
  mobileMiddlebar = null,
  fullWidth = false,
  showLogos = false,
}: {
  navigation: any
  children: JSX.Element
  title: string
  signOut: () => any
  user: any
  scrollable?: boolean
  displayScreenTitle?: boolean
  displayHeaderTitle?: boolean
  displaySidebar?: boolean
  searchbar?: boolean
  backButton?: boolean
  middlebar?: JSX.Element | null
  mobileMiddlebar?: JSX.Element | null
  fullWidth?: boolean
  showLogos?: boolean
}) {
  if (!signOut) signOut = authSignOut
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
        <Hidden from="md">
          <MobileHeader
            title={title}
            backButton={backButton}
            navigation={navigation}
            mobileMiddlebar={mobileMiddlebar}
            signOut={signOut}
            showLogos={showLogos}
          />
        </Hidden>
        <Hidden till="md">
          <Header
            toggleSidebar={toggleSidebar}
            title={title}
            menuButton={displaySidebar}
            searchbar={searchbar}
            middlebar={middlebar}
            displayHeaderTitle={displayHeaderTitle}
            backButton={backButton}
            navigation={navigation}
            signOut={signOut}
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
              <Sidebar signOut={signOut} />
            </Hidden>
          )}

          <Hidden till="md">
            <ScrollView
              flex={1}
              p={{ md: fullWidth ? 0 : 8 }}
              contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
            >
              <MainContent
                fullWidth={fullWidth}
                title={title}
                displayScreenTitle={displayScreenTitle}
                children={children}
              />
            </ScrollView>
          </Hidden>

          <Hidden from="md">
            <MainContent
              fullWidth={fullWidth}
              title={title}
              displayScreenTitle={displayScreenTitle}
              children={children}
            />
          </Hidden>
        </Box>
      </VStack>
    </>
  )
}
