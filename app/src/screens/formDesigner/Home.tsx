import React from 'react'
import DashboardLayout from 'components/DashboardLayout'
import { RootStackScreenProps } from 'utils/formDesigner/navigation'
import { HomeOption } from 'utils/types/home'
import HomeIndex from 'components/HomeIndex'
import i18n from 'i18n'

const options: HomeOption[] = [
  {
    icon: 'add-box',
    label: i18n.t('form.create-new'),
    to: 'FormEditor',
  },
  {
    icon: 'edit',
    label: i18n.t('form.edit-existing'),
    to: 'FormList',
  },
]

export default function ({ route, navigation }: RootStackScreenProps<'Home'>) {
  return (
    <DashboardLayout
      title={i18n.t('general.home')}
      displaySidebar={false}
      displayScreenTitle={false}
      backButton={false}
      navigation={navigation}
    >
      <HomeIndex options={options} navigation={navigation} route={route} />
      {/* <SafeAreaView
        style={[
          styles.formDesignerView,
          { paddingHorizontal: isWider ? 32 : 4 },
        ]}
      >
        <View style={[layout.hStackGap3, layout.justifyCenter, spacing.pt5]}>
          <Pressable
            onPress={() => navigation.navigate('FormEditor', route.params)}
          >
            <View
              style={[
                layout.center,
                backgrounds.primary600,
                borders.roundedMd,
                { height: 80, width: 190 },
              ]}
            >
              <View style={[layout.vStackGap3]}>
                <View style={[layout.center]}>
                  <Icon pack="material" name="add-box" fill="white" size={16} />
                </View>
                <Text
                  style={[
                    styleS.fontBold,
                    styleS.fontSizeLg,
                    { color: 'white' },
                  ]}
                >
                  Create a new form
                </Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('FormList', route.params)}
          >
            <View
              style={[
                layout.center,
                backgrounds.primary600,
                borders.roundedMd,
                { height: 80, width: 190 },
                shadows[3],
              ]}
            >
              <View style={[layout.vStackGap3]}>
                <View style={[layout.center]}>
                  <Icon
                    pack="material"
                    fill="white"
                    size="tiny"
                    // size={16}
                    name="edit"
                  />
                </View>
                <Text
                  style={
                    (styleS.fontBold, styleS.fontSizeLg, { color: 'white' })
                  }
                >
                  Edit an existing form
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </SafeAreaView> */}
    </DashboardLayout>
  )
}
