import React from 'react'
import {
  VStack,
  StatusBar,
  ScrollView,
  HStack,
  Pressable,
  Image,
  Hidden,
  Divider,
  Menu,
  Input,
} from 'native-base'
import { View, Dimensions, SafeAreaView } from 'react-native'
import { useSignOut } from 'utils/store'
import _ from 'lodash'

import medicapt_logo from '../../assets/medicapt.png'
import phr_logo from '../../assets/phr_small.png'
import { goBackMaybeRefreshing } from 'utils/navigation'

import {
  useStyleSheet,
  Text,
  Button,
  Icon,
  Avatar,
} from '@ui-kitten/components'
import themedStyles from 'themeStyled'
import styles, { spacing } from './styles'
import { colors, breakpoints } from './nativeBaseSpec'
import { MenuIcon } from './Icons'

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
            size={width > breakpoints.md ? 'medium' : 'tiny'}
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
                style={styles.dashboardButton}
                key={idx}
                appearance="ghost"
              >
                <HStack space="4" alignItems="center">
                  <Icon
                    size="6"
                    pack="material"
                    name={item.iconName}
                    fill={colors.coolGray[500]}
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
            style={styles.dashboardButton}
            appearance="ghost"
            onPress={signOut}
          >
            <HStack space="4" alignItems="center">
              <Icon
                size="6"
                pack="material"
                name="exit-to-app"
                fill={colors.coolGray[500]}
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
              <Button
                appearance="ghost"
                status="coolGray"
                onPress={toggleSidebar}
                accessoryLeft={
                  <MenuIcon size="6" fill={colors.coolGray[800]} />
                }
              />
            )}
            {backButton ? (
              <Button
                onPress={() =>
                  goBackMaybeRefreshing(route, navigation, reloadPrevious)
                }
                accessoryLeft={
                  <Icon
                    size="6"
                    pack="material"
                    name="keyboard_backspace"
                    fill={colors.coolGray[500]}
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
                  pack="material"
                  // as={FontAwesome}
                  fill={colors.coolGray[400]}
                />
              }
            />
          )}

          {middlebar}

          <HStack space="2" alignItems="center">
            <Button
              appearance="ghost"
              status="blueGray"
              accessoryLeft={
                <Icon
                  size="6"
                  name="lock"
                  pack="material"
                  fill={colors.coolGray[400]}
                />
              }
            />
            <Menu
              closeOnSelect={false}
              w="200"
              placement="bottom right"
              trigger={triggerProps => {
                return (
                  <Button
                    {...triggerProps}
                    appearance="ghost"
                    status="blueGray"
                    icon={<Avatar size="tiny" source={phr_logo} />}
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
                pack="material"
                name="keyboard_backspace"
                fill={colors.coolGray[800]}
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
                <Button
                  appearance="ghost"
                  status="blueGray"
                  onPress={() =>
                    goBackMaybeRefreshing(route, navigation, reloadPrevious)
                  }
                  accessoryLeft={
                    <Icon
                      size="6"
                      pack="material"
                      name="keyboard_backspace"
                      fill={colors.coolGray[50]}
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
              <Button
                appearance="ghost"
                status="blueGray"
                accessoryLeft={
                  <Icon
                    size="6"
                    name="lock"
                    pack="material"
                    fill={colors.coolGray[100]}
                  />
                }
              />
              <Menu
                w="150"
                trigger={triggerProps => {
                  return (
                    <Button
                      variant="ghost"
                      colorScheme="light"
                      accessibilityLabel="More options menu"
                      {...triggerProps}
                      icon={
                        <Icon
                          size="6"
                          fill={colors.coolGray[100]}
                          // color="coolGray.50"
                          name="more-vert"
                          pack="material"
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
