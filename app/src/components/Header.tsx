import React, { useState } from 'react'
import { View, Dimensions, Image, Pressable } from 'react-native'
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
  Input,
  MenuItem,
  OverflowMenu,
  MenuGroup,
} from '@ui-kitten/components'
import themedStyles from '../themeStyled'
import styles, { spacing, layout } from './styles'
import { colors, breakpoints } from './nativeBaseSpec'
import { MenuIcon } from './Icons'

interface IProps {
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
}
const { width } = Dimensions.get('window')
const isWider = width > breakpoints.md

const Header = (props: IProps) => {
  const {
    title,
    backButton,
    navigation,
    route,
    signOut,
    // mobileMiddlebar,
    // showLogos,
    reloadPrevious,
    menuButton,
    toggleSidebar,
    displayHeaderTitle,
    middlebar,
    searchbar,
  } = props
  const styleS = useStyleSheet(themedStyles)

  const [visible, setVisible] = useState<boolean>(false)
  const toggleMenuVisiblity = () => {
    setVisible(!visible)
  }
  const renderButton = (): React.ReactElement => (
    <Button appearance="ghost" onPress={toggleMenuVisiblity}>
      <Avatar size="small" source={phr_logo} />
    </Button>
  )
  return (
    <View
      style={[
        styles.headerWrapper,
        spacing.px6,
        spacing.py3,
        {
          backgroundColor: isWider ? 'white' : colors.primary[900],
        },
      ]}
    >
      <View style={[styles.headerBox, { maxWidth: menuButton ? 0 : 1016 }]}>
        <View style={[layout.hStack, layout.spaceBet, layout.alignCenter]}>
          <View style={[layout.hStackGap4, layout.alignCenter]}>
            {menuButton && (
              <Button
                appearance="ghost"
                status="basic"
                // status="coolGray"
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
                appearance="ghost"
                status="basic"
                accessoryLeft={
                  <Icon
                    size="6"
                    pack="material"
                    name="west"
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
                style={{ height: 40, width: 40 }}
                aria-label="Medicapt Logo"
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
              style={[styleS.px4, styleS.width30Percent]}
              size="small"
              placeholder="Search"
              accessoryLeft={
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

          <View style={[layout.hStack, layout.alignCenter]}>
            <Button
              appearance="ghost"
              status="basic"
              size="large"
              style={{ padding: 0, margin: 0 }}
              accessoryLeft={
                <Icon
                  style={{ width: 24, height: 24, fontSize: 24, padding: 0 }}
                  name="lock"
                  pack="material"
                  fill={colors.coolGray[500]}
                />
              }
            />
            <OverflowMenu
              // closeOnSelect={false}
              // style={{ width: 200 }}
              placement="bottom end"
              visible={visible}
              // selectedIndex={selectedIndex}
              // onSelect={onItemSelect}
              onBackdropPress={() => setVisible(false)}
              anchor={renderButton}
            >
              <MenuGroup title="Profile" initiallyExpanded>
                <MenuItem title="Account" />
                <MenuItem title="Settings" />
              </MenuGroup>
              <MenuGroup title="Shortcuts" initiallyExpanded>
                <MenuItem title="Lock" />
                <MenuItem onPress={signOut} title="Log out" />
              </MenuGroup>
            </OverflowMenu>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Header
