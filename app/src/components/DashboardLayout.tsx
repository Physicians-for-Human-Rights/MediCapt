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
  Hidden,
  IconButton,
  Divider,
  Menu,
  Avatar,
  Button,
  Input,
} from 'native-base'
import { View, Dimensions, SafeAreaView } from 'react-native'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'

import { useSignOut } from 'utils/store'
import _ from 'lodash'

import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr_small.png'
import { goBackMaybeRefreshing } from 'utils/navigation'

import { useStyleSheet, Text } from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import styles, { spacing } from './styles'
import { colors, breakpoints } from './nativeBaseSpec'

const styleS = useStyleSheet(themedStyles)
const { width } = Dimensions.get('window')

export function Sidebar(signOut: any) {
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
    <View style={styles.dashboardWrapper}>
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
              style={[
                styleS.fontSizeXl,
                styleS.fontBold,
                styleS.colorCoolGray800,
              ]}
            >
              Jane Doe
            </Text>
          </HStack>
          <Text
            style={[
              styleS.fontSizeLg,
              styleS.fontMedium,
              styleS.textCenter,
              styleS.colorCoolGray500,
            ]}
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
                    style={[
                      styleS.fontSizeMd,
                      styleS.fontMedium,
                      styleS.colorCoolGray800,
                    ]}
                  >
                    {item.iconText}
                  </Text>
                </HStack>
              </Button>
            )
          })}
        </VStack>
        <Divider />
        <View style={[spacing.px5, spacing.py2]}>
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
                style={[
                  styleS.fontSizeMd,
                  styleS.fontMedium,
                  styleS.colorCoolGray800,
                ]}
              >
                Logout
              </Text>
            </HStack>
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}

export function Header({
  title,
  backButton,
  navigation,
  route,
  signOut,
  mobileMiddlebar,
  showLogos,
  reloadPrevious,
  menuButton,
  toggleSidebar,
  displayHeaderTitle,
  middlebar,
  searchbar,
}: {
  title: string
  backButton: boolean
  navigation: any
  route: any
  signOut: () => any
  mobileMiddlebar: JSX.Element | null
  showLogos: boolean
  reloadPrevious: React.RefObject<boolean> | undefined
  menuButton: boolean
  toggleSidebar: () => any
  displayHeaderTitle: boolean
  middlebar: JSX.Element | null
  searchbar: boolean
}) {
  return (
    <View
      style={[
        styles.headerWrapper,
        spacing.px6,
        spacing.py3,
        {
          backgroundColor:
            width > breakpoints.md ? 'white' : colors.primary[900],
        },
      ]}
    >
      <VStack
        alignSelf="center"
        width="100%"
        maxW={menuButton ? null : '1016px'}
      >
        <HStack alignItems="center" justifyContent="space-between">
          <HStack space="4" alignItems="center">
            {menuButton && (
              <IconButton
                variant="ghost"
                colorScheme="light"
                onPress={toggleSidebar}
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
            {backButton ? (
              <IconButton
                onPress={() =>
                  goBackMaybeRefreshing(route, navigation, reloadPrevious)
                }
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
              <View style={{ width: 40 }} />
            )}
            {/* TODO What should the logo button do? It used to go back. */}
            <Pressable>
              <Image
                h="10"
                w={10}
                alt="Medicapt Logo"
                resizeMode="cover"
                source={medicapt_logo}
              />
            </Pressable>
            {displayHeaderTitle && (
              <Text
                style={[
                  styleS.fontSize3xl,
                  styleS.fontLight,
                  styleS.colorCoolGray500,
                ]}
              >
                {title}
              </Text>
            )}
          </HStack>

          {searchbar && (
            <Input
              px="4"
              w="30%"
              size="sm"
              placeholder="Search"
              InputLeftElement={
                <Icon
                  px="2"
                  size="4"
                  name="search"
                  as={FontAwesome}
                  _light={{
                    color: 'coolGray.400',
                  }}
                />
              }
            />
          )}

          {middlebar}

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
                <Menu.Item onPress={signOut}>Log out</Menu.Item>
              </Menu.Group>
            </Menu>
          </HStack>
        </HStack>
      </VStack>
    </View>
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
                name="arrowleft"
                _light={{ color: 'coolGray.800' }}
              />
            </Pressable>
            <Text style={[styleS.fontSizeLg, styleS.colorCoolGray800]}>
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
  route,
  signOut,
  mobileMiddlebar,
  showLogos,
  reloadPrevious,
}: {
  title: string
  backButton: boolean
  navigation: any
  route: any
  signOut: () => any
  mobileMiddlebar: JSX.Element | null
  showLogos: boolean
  reloadPrevious: React.RefObject<boolean> | undefined
}) {
  const localStyle = {
    borderColor: colors.coolGray[200],
    backgroundColor: width > breakpoints.md ? 'white' : colors.primary[900],
  }
  return (
    <View style={[spacing.px1, spacing.py4, localStyle]}>
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
                  onPress={() =>
                    goBackMaybeRefreshing(route, navigation, reloadPrevious)
                  }
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
                <View style={{ width: 40 }} />
              )}
              <Text style={[styleS.colorCoolGray50, styleS.fontSizeLg]}>
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
                          name="dots-vertical"
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
    </View>
  )
}

export default function DashboardLayout({
  navigation,
  route,
  children,
  title,
  scrollable = true,
  displayScreenTitle = true,
  displayHeaderTitle = true,
  displaySidebar = true,
  displayHeader = true,
  searchbar = false,
  backButton = true,
  middlebar = null,
  mobileMiddlebar = null,
  fullWidth = false,
  showLogos = false,
  reloadPrevious,
}: {
  navigation: any
  route?: any
  children: JSX.Element
  title: string
  scrollable?: boolean
  displayScreenTitle?: boolean
  displayHeaderTitle?: boolean
  displaySidebar?: boolean
  displayHeader?: boolean
  searchbar?: boolean
  backButton?: boolean
  middlebar?: JSX.Element | null
  mobileMiddlebar?: JSX.Element | null
  fullWidth?: boolean
  showLogos?: boolean
  reloadPrevious?: React.RefObject<boolean>
}) {
  const [signOut] = useSignOut()
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(true)
  function toggleSidebar() {
    setIsSidebarVisible(!isSidebarVisible)
  }
  return (
    <View>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />
      <SafeAreaView style={{ backgroundColor: colors.primary[900] }} />
      <VStack flex={1} bg="muted.50">
        {displayHeader && (
          <Hidden from="md">
            <MobileHeader
              title={title}
              backButton={backButton}
              navigation={navigation}
              mobileMiddlebar={mobileMiddlebar}
              signOut={signOut}
              showLogos={showLogos}
              route={route}
              reloadPrevious={reloadPrevious}
            />
          </Hidden>
        )}
        {displayHeader && (
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
              route={route}
              reloadPrevious={reloadPrevious}
              mobileMiddlebar={mobileMiddlebar}
              showLogos={showLogos}
            />
          </Hidden>
        )}

        <SafeAreaView
          style={[
            styles.dashbordContainer,
            { flexDirection: width > breakpoints.md ? 'row' : 'column' },
          ]}
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
        </SafeAreaView>
      </VStack>
    </View>
  )
}
