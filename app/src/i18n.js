import * as Localization from 'expo-localization'
import { I18n } from 'i18n-js'
import en from 'localization/en.json'
import fr from 'localization/fr.json'
import ja from 'localization/ja.json'

const i18n = new I18n()

i18n.store(en)
// i18n.store(ptBR)

// i18n.defaultLocale = 'en'
// i18n.locale = 'en'
i18n.fallbacks = true

// export const loadLocale = async () => {
//   for (const locale of Localization.locales) {
//     if (i18n.translations[locale.languageCode] !== null) {
//       i18n.locale = locale.languageCode
//       switch (locale.languageCode) {
//         case 'en':
//           import('localization/en.json').then(en => {
//             i18n.translations = { en }
//           })
//           break
//         default:
//         case 'fr':
//           import('localization/fr.json').then(fr => {
//             i18n.translations = { fr }
//           })
//           break
//       }
//       break
//     }
//   }
// }

export const loadTranslations = locale => {
  const response = require(`./localization/${locale}.json`)
  i18n.store(response)
}

export default i18n
