import React from 'react'
import {
  StatusBar,
  ScrollView,
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
import styles, { spacing, layout } from './styles'
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
        <View style={styles.dashboardLayoutBox}>
          <Avatar
            source={medicapt_logo}
            size={width > breakpoints.md ? 'medium' : 'tiny'}
          />
          <View style={layout.hStackCenterGap2}>
            <Text
              style={[
                styleS.fontSizeXl,
                styleS.fontBold,
                styleS.colorCoolGray800,
              ]}
            >
              Jane Doe
            </Text>
          </View>
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
        </View>
        <View style={[layout.vStack, spacing.px4, spacing.py4]}>
          {list.map((item: any, idx: number) => {
            return (
              <Button
                style={styles.dashboardButton}
                key={idx}
                appearance="ghost"
              >
                <View style={[layout.hStackGap4, layout.alignCenter]}>
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
                </View>
              </Button>
            )
          })}
        </View>
        <Divider />
        <View style={[spacing.px5, spacing.py2]}>
          <Button
            style={styles.dashboardButton}
            appearance="ghost"
            onPress={signOut}
          >
            <View style={[layout.hStackGap4, layout.alignCenter]}>
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
            </View>
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
      <View
        style={[styles.headerBox, { maxWidth: menuButton ? 'none' : 1016 }]}
      >
        <View style={[layout.hStack, layout.spaceBet, layout.alignCenter]}>
          <View style={[layout.hStackGap4, layout.alignCenter]}>
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
          </View>

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

          <View style={[layout.hStackGap2, layout.alignCenter]}>
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
          </View>
        </View>
      </View>
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
    <View
      style={[
        layout.vStack,
        { flex: 1, maxWidth: fullWidth ? undefined : '1016px', width: '100%' },
      ]}
    >
      {displayScreenTitle && (
        <Hidden till="md">
          <View style={[layout.hStackGap2, layout.alignCenter, spacing.mb4]}>
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
          </View>
        </Hidden>
      )}
      {children}
    </View>
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
      <View style={[layout.hStackGap2, layout.spaceBet]}>
        <View
          style={[
            layout.hStackGap2,
            layout.spaceBet,
            layout.alignCenter,
            layout.flex1,
          ]}
        >
          <>
            <View style={[layout.hStackGap1, layout.alignCenter]}>
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
                <View style={layout.hStack}>
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
                </View>
              ) : (
                <View style={{ width: 40 }} />
              )}
              <Text style={[styleS.colorCoolGray50, styleS.fontSizeLg]}>
                {title}
              </Text>
            </View>
            {mobileMiddlebar}
            <View style={layout.hStackGap1}>
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
            </View>
          </>
        </View>
      </View>
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
      <View
        style={[
          layout.vStack,
          layout.flex1,
          { backgroundColor: colors.muted[50] },
        ]}
      >
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
      </View>
    </View>
  )
}
