import React, { useState, useEffect, useCallback } from 'react'
import _ from 'lodash'
import { Text } from '@ui-kitten/components'
import { FormType } from 'utils/types/form'
// @ts-ignore typescript doesn't do native/web modules
import DisplayPDF from './DisplayPDF'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
import {
  lookupManifestByNameAndType,
  getFormTypeFromManifest,
} from 'utils/manifests'
import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  LayoutBounds as Box,
  rgb,
  grayscale,
  RGB,
  breakTextIntoLines,
  PDFPage,
} from 'pdf-lib'
import { mapSectionWithPaths, nameFormSections } from 'utils/forms'
import { allFormRenderCommands } from 'utils/formRendering/commands'
import { RenderCommand } from 'utils/formRendering/types'
import formatDate from 'utils/date.ts'
import i18n from 'i18n'
import { dataURItoBlob } from 'utils/data'
import { PageInfo, Row, rowSizeByType } from 'utils/formPrinting/types'
import { mkPageInfo } from 'utils/formPrinting/layout'
import { pageDebug } from 'utils/formPrinting/draw'
import {
  renderTitleHeader,
  renderFooter,
  handleCellCommand,
  renderSection,
} from 'utils/formPrinting/print'
import { RecordMetadata } from 'utils/types/recordMetadata'
import { layout } from './styles'
import { View } from 'react-native'

export default function FormPrinted({
  formMetadata,
  manifest,
  setManifest,
  recordMetadata,
}: {
  formMetadata: Partial<FormMetadata>
  manifest: FormManifestWithData
  setManifest: any
  recordMetadata?: Partial<RecordMetadata>
}) {
  const [width, setWidth] = useState(null as number | null)
  const [debug, setDebug] = useState(false)
  const [usPageSize, setUsPageSize] = useState(true)
  const [mock, setMock] = useState(true)
  const [pdf, setPdf] = useState(
    lookupManifestByNameAndType(manifest, 'form.pdf', 'application/pdf')!.data
  )

  useEffect(() => {
    async function fn() {
      try {
        const doc = await PDFDocument.create()
        // TODO toggle page size
        const pageSize = usPageSize ? PageSizes.Letter : PageSizes.A4
        const font = await doc.embedFont(StandardFonts.Helvetica)
        const fontO = await doc.embedFont(StandardFonts.HelveticaOblique)
        const fontB = await doc.embedFont(StandardFonts.HelveticaBold)
        const fontBO = await doc.embedFont(StandardFonts.HelveticaBoldOblique)
        const fontSize = 12
        let page: PDFPage = doc.addPage(pageSize)

        const skipTopWithTitle = 120
        const skipTop = 0
        const skipBottom = 50
        const indent = 0.01

        let pi: PageInfo = mkPageInfo(
          page,
          doc,
          pageSize,
          0.07,
          { font, fontO, fontB, fontBO },
          { skipTopWithTitle, skipTop, skipBottom },
          indent,
          {
            gapBetweenLabelAndData: 0.2,
            gapBetweenRows: 0.5,
            gapBetweenCells: 0.02,
          },
          debug,
          { h1: 1.3, h2: 1.1, lg: 1, md: 0.8, sm: 0.64 },
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

        const form: FormType = getFormTypeFromManifest(manifest)!

        const pdfSections = form?.pdf?.pdfSections

        if (
          pdfSections &&
          _.isArray(pdfSections) &&
          pdfSections[0] &&
          _.isObject(pdfSections[0]) &&
          _.isObject(pdfSections[0][_.keys(pdfSections[0])[0]])
        ) {
          const pdfSection = pdfSections[0][_.keys(pdfSections[0])[0]]
          await renderTitleHeader(
            pi,
            manifest,
            formMetadata,
            pdfSection.title,
            pdfSection.subtitle,
            pdfSection.id,
            pdfSection.logo,
            pdfSection.description
          )
        } else {
          await renderTitleHeader(pi, manifest, formMetadata)
        }

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
            i18n.t('form.not-filled'),
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
            _.join(
              _.concat(
                formMetadata.formID ? ['Form ' + formMetadata.formID] : [],
                recordMetadata && recordMetadata.recordID
                  ? ['Record ' + recordMetadata.recordID]
                  : []
              ),
              '  —  '
            ),
            'MDL code xyz'
          )
        }

        setPdf(await doc.saveAsBase64({ dataUri: true }))
      } catch (e) {
        console.error(e)
      }
    }
    fn()
  }, [
    debug,
    mock,
    usPageSize,
    lookupManifestByNameAndType(manifest, 'form.yaml', 'text/yaml')!.sha256,
  ])

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

  if (pdf) {
    return (
      <View
        onLayout={event => {
          setWidth(event.nativeEvent.layout.width)
        }}
      >
        <DisplayPDF
          width={'500'}
          file={pdf}
          debug={debug}
          toggleDebug={() => setDebug(x => !x)}
          mock={mock}
          toggleMock={() => setMock(x => !x)}
          usPageSize={usPageSize}
          toggleUsPageSize={() => setUsPageSize(x => !x)}
          downloadPdf={downloadPdf}
        />
      </View>
    )
  }
  return (
    <View style={layout.vStack}>
      <Text>{i18n.t('form.pdfNotUploaded')}</Text>
    </View>
  )
}
