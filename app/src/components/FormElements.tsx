import { nameFormSections } from 'utils/forms'
import _ from 'lodash'

// export const formSections = (overviewSection: any, i18n: any, form: any) => {
//   return _.concat(
//     overviewSection
//       ? [
//           {
//             name: i18n.t('record.overview.record-overview'),
//             title: i18n.t('record.overview.section-title'),
//             parts: [],
//           },
//         ]
//       : [],
//     nameFormSections(form.sections)
// }

// export const isSectionCompleteList = (form) => {
//   return form
//   ? _.map(formSections, section =>
//       isSectionComplete(section, form.common, flatRecord)
//     )
//   : []
// }
