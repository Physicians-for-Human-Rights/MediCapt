import React, { useState, useEffect, useCallback } from 'react'
import _ from 'lodash'
import { FormType } from 'utils/types/form'
// @ts-ignore typescript doesn't do native/web modules
import DisplayPDF from './DisplayPDF'
import { FormMetadata, FormManifestWithData } from 'utils/types/formMetadata'
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
import { useStoreState } from 'utils/store'

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
import { dataURItoBlob } from 'utils/data'
import { PageInfo, Row, rowSizeByType } from 'utils/formPrinting/types'
import {
  pageDebug,
  debugPoint,
  box,
  line,
  text,
  image,
  mkImage,
  mkText,
  renderRowLines,
  startPage,
} from 'utils/formPrinting/draw'
import {
  mkPageInfo,
  updatePageInfo,
  overflowsPage,
  hasSpaceOnRow,
} from 'utils/formPrinting/layout'

export async function renderTitleHeader(
  pi: PageInfo,
  manifest: FormManifestWithData,
  formMetadata: Partial<FormMetadata>,
  title?: string,
  subtitle?: string,
  id?: string,
  logo?: string,
  description?: string
) {
  const ny1 = text(pi, title || formMetadata.title || 'Form', {
    scale: pi.h1,
    xcenter: true,
    y: 0,
    bold: true,
  })
  const ny2 = text(pi, subtitle || formMetadata.subtitle || '', {
    scale: pi.md,
    xcenter: true,
    y: ny1.y + 5,
    bold: true,
  })
  const ny3 = text(
    pi,
    id ||
      (formMetadata['official-name'] && formMetadata['official-code']
        ? formMetadata['official-name'] + '-' + formMetadata['official-code']
        : ''),
    {
      scale: pi.h2,
      xcenter: true,
      y: ny2.y + 10,
      bold: true,
    }
  )
  if (logo) {
    await image(
      pi,
      manifest,
      logo,
      pi.maxX - 100,
      50 + pi.fontSize * pi.h1 + 10,
      100,
      100
    )
  }
  if (description)
    text(pi, description, {
      scale: pi.md,
      x: 10,
      y: ny3.y + 20,
      maxW: pi.w * 0.7,
    })
}

export async function renderFooter(
  pi: PageInfo,
  pageNumber: number,
  pis: PageInfo[],
  left: string,
  middle: string,
  right: string
) {
  text(pi, pageNumber + ' of ' + pis.length + ' printed from MediCapt', {
    scale: pi.sm,
    xcenter: true,
    y: pi.maxY - pi.minY - 10,
  })
  text(pi, middle, {
    scale: pi.sm,
    xcenter: true,
    y: pi.maxY - pi.minY - 10 - pi.sm * pi.fontSize * 1.5,
  })
  text(pi, left, {
    scale: pi.md,
    x: 0,
    y: pi.maxY - pi.minY - 10,
  })
  text(pi, right, {
    scale: pi.sm,
    x:
      pi.maxX - pi.minX - pi.font.widthOfTextAtSize(right, pi.sm * pi.fontSize),
    y: pi.maxY - pi.minY - 10,
  })
}

export async function handleCellCommand(
  pi: PageInfo,
  manifest: FormManifestWithData,
  mock: boolean,
  notFilled: string,
  title: RenderCommand & { type: 'title' },
  command: RenderCommand,
  iposition: Row,
  silent: boolean = false,
  skipOutline: boolean = false,
  skipHeading: boolean = false
): Promise<Row> {
  const state = useStoreState()
  const i18n = state?.i18n
  var titleSize = text(pi, title.title, {
    scale: pi.md,
    x: 0,
    y: 0,
    bold: true,
    silent: true,
  })
  const rowSize = Math.max(
    pi.gapBetweenCells + titleSize.x / (pi.maxX - pi.minX),
    rowSizeByType[command.type]
  )
  let position: Row
  if (hasSpaceOnRow(rowSize, iposition)) {
    position = _.clone(iposition)
  } else {
    position = renderRowLines(pi, iposition, skipOutline)
    position = {
      x: pi.minX,
      y: iposition.y + iposition.rowHeight + pi.gapBetweenRows * pi.fontSize,
      rowFill: 0,
      rowHeight: 0,
      hadBreak: true,
      nr: 0,
      pending: [],
    }
  }
  var npos = text(pi, title.title, {
    scale: pi.md,
    x: position.rowFill * (pi.maxX - pi.minX),
    y: position.y,
    bold: true,
    silent: skipHeading,
    maxW: pi.maxX - pi.minX - pi.gapBetweenCells,
  })
  switch (command.type) {
    // TODO Handle other everywhere
    case 'list-with-labels': {
      return mkText(
        pi,
        command.recordValue
          ? command.recordValue.value.selection!
          : mock
          ? '' + rand(command.options!).value
          : notFilled,
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'date': {
      return mkText(
        pi,
        command.recordValue
          ? formatDate(command.recordValue.value, 'PPP')
          : mock
          ? formatDate(randPastDate(), 'PPP')
          : notFilled,
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'date-time': {
      return mkText(
        pi,
        command.recordValue
          ? formatDate(command.recordValue.value, 'PPPppp')
          : mock
          ? formatDate(randPastDate(), 'PPPppp')
          : notFilled,
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'text': {
      return mkText(
        pi,
        command.recordValue?.value ||
          (mock ? _.join(randText({ length: 10 }), ' ') : notFilled),
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'long-text': {
      return mkText(
        pi,
        command.recordValue?.value ||
          (mock ? _.join(randText({ length: 40 }), ' ') : notFilled),
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'number': {
      return mkText(
        pi,
        command.recordValue?.value ||
          (mock ? '' + randNumber({ min: 0, max: 10000000 }) : notFilled),
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'phone-number': {
      return mkText(
        pi,
        command.recordValue?.value ||
          (mock ? '' + randPhoneNumber() : notFilled),
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'bool': {
      return mkText(
        pi,
        command.recordValue
          ? command.recordValue?.value
            ? i18n.t('form.Yes')
            : i18n.t('form.No')
          : mock
          ? randBoolean()
            ? i18n.t('form.Yes')
            : i18n.t('form.No')
          : notFilled,
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'gender': {
      return mkText(
        pi,
        command.recordValue
          ? i18n.t('gender.' + command.recordValue?.value)
          : mock
          ? i18n.t('gender.' + command.options[rand(_.keys(command.options))])
          : notFilled,
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'address': {
      return mkText(
        pi,
        command.recordValue
          ? command.recordValue?.value
          : mock
          ? _.join(_.values(randAddress()), ', ')
          : notFilled,
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    case 'signature': {
      if (mock)
        return await mkImage(
          pi,
          manifest,
          'signature',
          command,
          npos,
          position,
          rowSize,
          silent
        )
      if (command.recordValue && command.recordValue.value.sha256) {
        return await mkImage(
          pi,
          manifest,
          command.recordValue.value.sha256,
          command,
          npos,
          position,
          rowSize,
          silent
        )
      } else {
        return mkText(pi, notFilled, command, npos, position, rowSize, {
          silent: silent,
        })
      }
    }
    case 'list-multiple': {
      return mkText(
        pi,
        command.recordValue
          ? _.join(
              _.map(
                _.filter(
                  _.zip(
                    command.recordValue?.value.selections,
                    command.options as string[]
                  ),
                  e => e[0] && !_.isEmpty(e[1])
                ),
                // @ts-ignore TODO
                e => e[1]
              ),
              '\n'
            )
          : mock
          ? _.join(
              _.map(
                _.filter(
                  _.zip(
                    _.map(_.range(command.options.length), _x => randBoolean()),
                    command.options as string[]
                  ),
                  e => e[0] && !_.isEmpty(e[1])
                ),
                // @ts-ignore TODO
                e => e[1]
              ),
              '\n'
            )
          : notFilled,
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
    default: {
      return mkText(
        pi,
        'MISSING ' + command.type,
        command,
        npos,
        position,
        rowSize,
        { silent: silent }
      )
    }
  }
}

export async function renderRow(
  pi: PageInfo,
  pis: PageInfo[],
  manifest: FormManifestWithData,
  mock: boolean,
  notFilled: string,
  commands: RenderCommand[],
  position: Row,
  i: number,
  skipTitles: boolean,
  skipBody: boolean,
  skipOutline: boolean,
  skipHeadings: boolean
): Promise<{ position: Row; i: number; pi: PageInfo }> {
  let renderedRow = false
  for (; i < commands.length; i++) {
    const command = commands[i]
    if (command.type === 'section-heading') {
      let tmpPosition: Row = {
        x: pi.minX,
        y: position.y + position.rowHeight + (pi.gapBetweenRows + 5) * pi.h1,
        rowFill: 0,
        rowHeight: 0,
        nr: 0,
        hadBreak: false,
        pending: [],
      }
      tmpPosition = mkText(
        pi,
        command.title,
        command,
        tmpPosition,
        tmpPosition,
        1,
        {
          scale: pi.h1,
          bold: true,
          lineHeight: 1.3,
          silent: true,
        }
      )

      let potentialPosition: Row | undefined
      for (let j = i; j < commands.length; j++) {
        const command = commands[j]
        if (
          command.type === 'title' &&
          command.originalType &&
          command.originalType === commands[j + 1].type
        ) {
          potentialPosition = await handleCellCommand(
            pi,
            manifest,
            mock,
            notFilled,
            command,
            commands[j + 1],
            tmpPosition,
            true,
            true,
            true
          )
          break
        }
      }

      if (potentialPosition && overflowsPage(pi, potentialPosition)) {
        ;({ position, pi } = startPage(
          pi,
          pis,
          position,
          skipOutline,
          skipTitles
        ))
      }
      position = {
        x: pi.minX,
        y: position.y + position.rowHeight + (pi.gapBetweenRows + 5) * pi.h1,
        rowFill: 0,
        rowHeight: 0,
        nr: 0,
        hadBreak: false,
        pending: [],
      }
      position = mkText(pi, command.title, command, position, position, 1, {
        scale: pi.h1,
        bold: true,
        lineHeight: 1.3,
        silent: skipTitles,
      })
      position = { ...position, thickSeparator: true }
      break
    }
    if (
      command.type === 'title' &&
      command.originalType &&
      command.originalType === commands[i + 1].type
    ) {
      const potentialPosition = await handleCellCommand(
        pi,
        manifest,
        mock,
        notFilled,
        command,
        commands[i + 1],
        position,
        true,
        true,
        true
      )
      if (potentialPosition.hadBreak && renderedRow) {
        return { position, i: i - 1, pi }
      }
      position = await handleCellCommand(
        pi,
        manifest,
        mock,
        notFilled,
        command,
        commands[i + 1],
        position,
        skipBody,
        skipOutline,
        skipHeadings
      )
      renderedRow = true
      i = i + 1
    }
  }
  return { position, i, pi }
}

export async function renderSection(
  pi: PageInfo,
  pis: PageInfo[],
  manifest: FormManifestWithData,
  mock: boolean,
  notFilled: string,
  commands: RenderCommand[],
  position: Row,
  skipTitles: boolean,
  skipBody: boolean,
  skipOutline: boolean,
  skipHeadings: boolean
): Promise<{ position: Row; pi: PageInfo }> {
  for (let i = 0; i < commands.length; i++) {
    // Compute the layout of the row without rendering it fist
    const { position: rowMetrics } = await renderRow(
      pi,
      pis,
      manifest,
      mock,
      notFilled,
      commands,
      position,
      i,
      true,
      true,
      true,
      true
    )
    if (overflowsPage(pi, rowMetrics)) {
      ;({ position, pi } = startPage(pi, pis, position, skipOutline, false))
    }
    ;({ position, i, pi } = await renderRow(
      pi,
      pis,
      manifest,
      mock,
      notFilled,
      commands,
      position,
      i,
      skipTitles,
      skipBody,
      skipOutline,
      skipHeadings
    ))
  }
  position = renderRowLines(pi, position, skipOutline)
  return { position, pi }
}
