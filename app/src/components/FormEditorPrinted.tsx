import React, { useState, useEffect, useCallback } from 'react'
import _ from 'lodash'
import { Text, VStack, View } from 'native-base'
import { FormType } from 'utils/types/form'
// @ts-ignore typescript doesn't do native/web modules
import DisplayPDF from './DisplayPDF'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import {
  isImage,
  isInManifest,
  filterManifest,
  mapManifest,
  addFileToManifest,
  makeManifestEntry,
  changeFilenameInManifest,
  lookupManifestByNameAndType,
  addOrReplaceFileToManifestByFilename,
  lookupManifest,
  getRecordTypeFormManifest,
  getFormTypeFromManifest,
} from 'utils/manifests'
import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  PDFFont,
  TextAlignment,
  LayoutBounds as Box,
  rgb,
  grayscale,
  RGB,
  breakTextIntoLines,
  PDFPage,
} from 'pdf-lib'
import { tryConvertToJpeg } from 'utils/imageConverter.web'
import { mapSectionWithPaths, nameFormSections } from 'utils/forms'
import { allFormRenderCommands } from 'utils/formRendering/commands'
import { RenderCommand } from 'utils/formRendering/types'
import formatDate from 'utils/date.ts'
import {
  randBoolean,
  randNumber,
  randPastDate,
  randSentence,
  randText,
  rand,
  randAddress,
  randPhoneNumber,
} from '@ngneat/falso'
import { t } from 'i18n-js'
import { dataURItoBlob } from 'utils/data'
import { PageInfo, Row, rowSizeByType } from 'utils/formPrinting/types'
import {
  mkPageInfo,
  updatePageInfo,
  overflowsPage,
  hasSpaceOnRow,
} from 'utils/formPrinting/layout'
import {
  mkPage,
  pageDebug,
  debugPoint,
  box,
  line,
  text,
  mkImage,
  mkText,
  renderRowLines,
  startPage,
} from 'utils/formPrinting/draw'
import {
  renderTitleHeader,
  renderFooter,
  handleCellCommand,
  renderSection,
} from 'utils/formPrinting/print'
import FormPrinted from 'components/FormPrinted'

export default function FormEditorPrinted({
  formMetadata,
  manifest,
  setManifest,
}: {
  formMetadata: Partial<FormMetadata>
  manifest: FormManifestWithData
  setManifest: any
}) {
  return (
    <FormPrinted
      formMetadata={formMetadata}
      manifest={manifest}
      setManifest={setManifest}
    />
  )
}
