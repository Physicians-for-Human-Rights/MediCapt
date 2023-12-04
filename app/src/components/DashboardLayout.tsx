import React, { useState } from 'react'
import {
  View,
  Dimensions,
  SafeAreaView,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native'
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
  Divider,
  MenuItem,
  OverflowMenu,
} from '@ui-kitten/components'
import themedStyles from '../themeStyled'
import styles, { spacing, layout } from './styles'
import { colors, breakpoints } from './nativeBaseSpec'
import Header from './Header'
import { useStoreState } from '../utils/store'

const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

export function Sidebar(signOut: any) {
  const styleS = useStyleSheet(themedStyles)
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
          <Avatar source={medicapt_logo} size={isWider ? 'medium' : 'tiny'} />
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
  const styleS = useStyleSheet(themedStyles)
  return (
    <View
      style={[
        layout.vStack,
        { flex: 1, maxWidth: fullWidth ? undefined : 1016, width: '100%' },
      ]}
    >
      {displayScreenTitle && (
        <View style={{ display: isWider ? 'flex' : 'none' }}>
          <View style={[layout.hStackGap2, layout.alignCenter, spacing.mb4]}>
            <Pressable>
              <Icon
                size="6"
                pack="material"
                name="west"
                fill={colors.coolGray[800]}
              />
            </Pressable>
            <Text style={[styleS.fontSizeLg, styleS.colorCoolGray800]}>
              {title}
            </Text>
          </View>
        </View>
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
  const state = useStoreState()
  const i18n = state?.i18n
  const localStyle = {
    borderColor: colors.coolGray[200],
    backgroundColor: isWider ? 'white' : colors.primary[900],
  }
  const styleS = useStyleSheet(themedStyles)
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
                      name="west"
                      fill={colors.coolGray[50]}
                    />
                  }
                />
              ) : showLogos ? (
                <View style={layout.hStack}>
                  <Image
                    style={{ height: 10, width: 10, marginHorizontal: 16 }}
                    aria-label={i18n.t('imagesAlt.logoMedicapt')}
                    resizeMode="cover"
                    source={medicapt_logo}
                  />
                  <Image
                    style={{ height: 10, width: 10, marginHorizontal: 16 }}
                    aria-label={i18n.t('imagesAlt.logoPHR')}
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
              <OverflowMenu
                style={{ width: 150 }}
                anchor={triggerProps => {
                  return (
                    <Button
                      variant="ghost"
                      colorScheme="light"
                      aria-label={i18n.t('general.moreOptionsMenu')}
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
                <MenuItem title={i18n.t('general.account')} />
                <MenuItem title={i18n.t('general.settings')} />
                <Divider style={[styleS.mt3, styleS.width100Percent]} />
                <MenuItem title={i18n.t('general.lock')} />
                <MenuItem onPress={signOut} title={i18n.t('general.logOut')} />
              </OverflowMenu>
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
        {/* {displayHeader && (
          <View style={{ display: isWider ? 'none' : 'flex' }}>
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
          </View>
        )} */}
        {displayHeader && (
          <View style={{ display: isWider ? 'flex' : 'none' }}>
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
          </View>
        )}

        <SafeAreaView
          style={[
            styles.dashbordContainer,
            { flexDirection: isWider ? 'row' : 'column' },
          ]}
        >
          {isSidebarVisible && displaySidebar && (
            <View style={{ display: isWider ? 'flex' : 'none' }}>
              <Sidebar signOut={signOut} />
            </View>
          )}

          <View
            style={{
              display: isWider ? 'flex' : 'none',
              marginHorizontal: 'auto',
              width: '100%',
            }}
          >
            <ScrollView
              style={[
                layout.flex1,
                { padding: isWider ? (fullWidth ? 0 : 32) : 0 },
                // { alignItems: 'center', flexGrow: 1 },
              ]}
              contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
            >
              <MainContent
                fullWidth={fullWidth}
                title={title}
                displayScreenTitle={displayScreenTitle}
                children={children}
              />
            </ScrollView>
          </View>

          <View style={{ display: isWider ? 'none' : 'flex' }}>
            <MainContent
              fullWidth={fullWidth}
              title={title}
              displayScreenTitle={displayScreenTitle}
              children={children}
            />
          </View>
        </SafeAreaView>
      </View>
    </View>
  )
}
