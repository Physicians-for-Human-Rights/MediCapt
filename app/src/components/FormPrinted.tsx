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

export default function FormPrinted({
  formMetadata,
  manifest,
  setManifest,
}: {
  formMetadata: Partial<FormMetadata>
  manifest: FormManifestWithData
  setManifest: any
}) {
  const [width, setWidth] = useState(null as number | null)
  const [debug, setDebug] = useState(false)
  const [mock, setMock] = useState(true)
  const [pdf, setPdf] = useState(
    lookupManifestByNameAndType(manifest, 'form.pdf', 'application/pdf')!.data
  )

  useEffect(() => {
    async function fn() {
      try {
        const doc = await PDFDocument.create()
        // TODO Set metadata
        // TODO toggle page size
        const pageSize = false ? PageSizes.Letter : PageSizes.A4
        const font = await doc.embedFont(StandardFonts.Helvetica)
        const fontO = await doc.embedFont(StandardFonts.HelveticaOblique)
        const fontB = await doc.embedFont(StandardFonts.HelveticaBold)
        const fontBO = await doc.embedFont(StandardFonts.HelveticaBoldOblique)
        const fontSize = 12
        const h1 = 1.3
        const h2 = 1.1
        const lg = 1
        const md = 0.8
        const sm = 0.64
        let page: PDFPage = doc.addPage(pageSize)

        const skipTopWithTitle = 120
        const skipTop = 0
        const skipBottom = 50
        const notFilled = 'N/A'
        const indent = 0.01
        const gapBetweenLabelAndData = 0.2
        const gapBetweenRows = 0.5
        const gapBetweenCells = 0.02 // TODO Implement me

        let pi: PageInfo = mkPageInfo(
          page,
          doc,
          pageSize,
          0.07,
          { font, fontO, fontB, fontBO },
          { skipTopWithTitle, skipTop, skipBottom },
          indent,
          { gapBetweenLabelAndData, gapBetweenRows, gapBetweenCells },
          debug,
          { h1, h2, lg, md, sm },
          fontSize
        )
        let pis = [pi]
        pageDebug(pi, debug)

        const skipTitles = false
        const skipOutline = false
        const skipBody = false
        const skipHeadings = false
        let position: Row = {
          x: 0,
          y: skipTopWithTitle,
          rowFill: 0,
          rowHeight: 0,
          hadBreak: false,
          nr: 0,
          pending: [],
        }

        await renderTitleHeader(
          pi,
          manifest,
          'Post Rape Care Form (PRC) — PART A',
          'FORM IS NOT FOR SALE',
          'MOH 363',
          'ministry_logo',
          'Ministry of Health National Rape Management Guidelines: Examination documentation form for survivors of rape/sexual violence (to be used as clinical notes to guide filling in of the P3 form).'
        )

        const form: FormType = getFormTypeFromManifest(manifest)!
        for (const section of nameFormSections(form.sections)) {
          const commands = _.concat(
            [
              {
                type: 'section-heading',
                title: section.title,
                valuePath: [],
                key: '',
                disable: false,
              },
            ],
            allFormRenderCommands(
              section,
              form.common,
              manifest.contents,
              {},
              true
            )
          )
          ;({ position, pi } = await renderSection(
            pi,
            pis,
            manifest,
            mock,
            notFilled,
            _.filter(commands, c => c.type !== 'description'),
            position,
            skipTitles,
            skipBody,
            skipOutline,
            skipHeadings
          ))
        }

        for (const selectedPi of pis) {
          pi = selectedPi
          page = selectedPi.page
          await renderFooter(
            pi,
            pi.pageNumber,
            pis,
            formatDate(new Date(), 'PPP'),
            'MR3-ADE-7DJ-2XY',
            'MDL code xyz'
          )
        }

        setPdf(await doc.saveAsBase64({ dataUri: true }))
      } catch (e) {
        console.error(e)
      }
    }
    fn()
  }, [debug, mock])

  const downloadPdf = useCallback(async () => {
    try {
      var url = window.URL.createObjectURL(dataURItoBlob(pdf))
      const tempLink = document.createElement('a')
      tempLink.href = url
      tempLink.setAttribute('download', 'preview.pdf')
      tempLink.click()
    } catch (e) {
      console.error(e)
    }
  }, [pdf])

  if (isInManifest(manifest, e => e.filename == 'form.pdf')) {
    return (
      <View
        onLayout={event => {
          setWidth(event.nativeEvent.layout.width)
        }}
      >
        {width && (
          <DisplayPDF
            width={width}
            file={pdf}
            debug={debug}
            toggleDebug={() => setDebug(x => !x)}
            mock={mock}
            toggleMock={() => setMock(x => !x)}
            downloadPdf={downloadPdf}
          />
        )}
      </View>
    )
  }
  return (
    <VStack>
      <Text>PDF is not uploaded</Text>
    </VStack>
  )
}
