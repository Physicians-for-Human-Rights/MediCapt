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
import { Row, PageInfo } from 'utils/formPrinting/types'
import {
  centerX,
  hasSpaceOnRow,
  overflowsPage,
  updatePageInfo,
} from 'utils/formPrinting/layout'

export function mkPage(pi: PageInfo, pis: PageInfo[]) {
  const page = pi.doc.addPage(pi.pageSize)
  pi = updatePageInfo(pi, page)
  pis.push(pi)
  pageDebug(pi, pi.debug)
  return pi
}

export function startPage(
  pi: PageInfo,
  pis: PageInfo[],
  position: Row,
  skipOutline: boolean,
  skip: boolean
) {
  position = renderRowLines(pi, position, skipOutline)
  position = {
    ...position,
    pending: [],
    endPage: false,
  }
  if (!skip) {
    pi = mkPage(pi, pis)
  }
  position = {
    ...position,
    rowHeight: 0,
    y: pi.skipTop,
  }
  return { position, pi }
}

export function box(pi: PageInfo, b: Box) {
  pi.page.drawRectangle({
    x: b.x,
    y: b.y,
    width: b.width,
    height: b.height,
    color: rgb(1, 1, 1),
    borderWidth: 1,
    borderColor: grayscale(0.5),
  })
}

export function pageDebug(pi: PageInfo, debug: boolean) {
  if (debug) {
    box(pi, { x: 0, y: 0, width: pi.width, height: pi.height })
    box(pi, {
      x: pi.minX,
      y: pi.minY,
      width: pi.maxX - pi.minX,
      height: pi.maxY - pi.minY,
    })
  }
}

export function debugPoint(
  pi: PageInfo,
  b: { x: number; y: number },
  color?: RGB
) {
  pi.page.drawCircle({
    x: pi.minX + b.x,
    y: pi.maxY - b.y,
    size: 1,
    color: color || rgb(1, 0, 0),
  })
}

export function line(
  pi: PageInfo,
  start: { x: number; y: number },
  end: { x: number; y: number },
  thickness: number,
  silent?: boolean
) {
  if (!silent)
    pi.page.drawLine({
      start,
      end,
      thickness,
    })
}

export function text(
  pi: PageInfo,
  text: string,
  options: {
    scale?: number
    xcenter?: boolean
    ycenter?: boolean
    box?: Box
    x?: number
    y?: number
    bold?: boolean
    italics?: boolean
    maxW?: number
    lineHeight?: number
    silent?: boolean
  } = {}
): { x: number; y: number } {
  const localFont = options.bold
    ? options.italics
      ? pi.fontBO
      : pi.fontB
    : options.italics
    ? pi.fontO
    : pi.font
  const sz = options.scale ? options.scale * pi.fontSize : pi.fontSize
  if (options.box && pi.debug) {
    box(pi, options.box)
  }
  const px = options.xcenter
    ? options.box
      ? centerX(
          text,
          localFont,
          sz,
          options.box.x,
          options.box.x + options.box.width
        )
      : centerX(text, localFont, sz, pi.minX, pi.maxX)
    : options.x
    ? options.x + pi.minX
    : pi.minX
  const py =
    pi.maxY -
    (options.ycenter
      ? options.box
        ? options.box.y + options.box.width - sz / 2
        : (pi.maxY - pi.minY) / 2 - sz / 2
      : options.y! + sz)
  if (!(options && options.silent))
    pi.page.drawText(text, {
      x: px,
      y: py,
      size: sz,
      font: localFont,
      maxWidth: options.maxW,
      lineHeight: (options.lineHeight || 1.1) * sz,
    })
  if (options.box && options.maxW)
    throw 'Cannot use both box and maxW in pdf text'
  const lines = options.maxW
    ? breakTextIntoLines(
        text,
        pi.doc.defaultWordBreaks,
        options.maxW,
        (t: string) => localFont.widthOfTextAtSize(t, sz)
      )
    : [text]
  const newY =
    pi.maxY - (options.y! + (options.lineHeight || 1.1) * sz * lines.length)
  return {
    x: options.maxW || localFont.widthOfTextAtSize(text, sz),
    y: pi.maxY - newY,
  }
}

export async function image(
  pi: PageInfo,
  manifest: FormManifestWithData,
  filename: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const jpgImage = await pi.doc.embedJpg(
    await tryConvertToJpeg(
      lookupManifest(manifest, e => e.filename === filename)!.data,
      0.6
    )
  )
  const ratio = jpgImage.width / jpgImage.height
  if (ratio > 1) {
    var iw = w
    var ih = h / ratio
  } else {
    var iw = w * ratio
    var ih = h
  }
  if (pi.debug) box(pi, { x: x, y: pi.height - y - h, width: w, height: h })
  pi.page.drawImage(jpgImage, {
    x: x,
    y: pi.height - y - ih,
    width: iw,
    height: ih,
  })
  return { x: iw, y: pi.height - y - ih }
}

export async function image2(
  pi: PageInfo,
  manifest: FormManifestWithData,
  filename: string,
  x: number,
  y: number,
  w: number,
  h: number,
  silent: boolean = false
) {
  const jpgImage = await pi.doc.embedJpg(
    await tryConvertToJpeg(
      lookupManifest(manifest, e => e.filename === filename)!.data,
      0.6
    )
  )
  const ratio = jpgImage.width / jpgImage.height
  if (ratio > 1) {
    var iw = w
    var ih = h / ratio
  } else {
    var iw = w * ratio
    var ih = h
  }
  if (pi.debug)
    box(pi, { x: pi.minX + x, y: pi.maxY - y - h, width: w, height: h })
  if (!silent) {
    pi.page.drawImage(jpgImage, {
      x: pi.minX + x,
      y: pi.maxY - y - ih,
      width: iw,
      height: ih,
    })
  }
  return { x: iw, y: pi.height - y - ih, w: iw, h: ih }
}

export async function mkImage(
  pi: PageInfo,
  manifest: FormManifestWithData,
  image: string,
  // @ts-ignore
  command: RenderCommand,
  npos: { x: number; y: number },
  position: Row,
  rowSize: number,
  silent: boolean
) {
  const { h: realImageHeight } = await image2(
    pi,
    manifest,
    image,
    (pi.indent + position.rowFill) * (pi.maxX - pi.minX),
    npos.y + pi.fontSize * pi.gapBetweenLabelAndData,
    0.2 * (pi.maxX - pi.minX),
    0.2 * (pi.maxX - pi.minX),
    silent
  )
  return {
    x: 0,
    y: position.y,
    rowFill: position.rowFill + rowSize,
    rowHeight: Math.max(
      position.rowHeight,
      // TODO Why is the 1.2 factor needed here?
      realImageHeight * 1.2 + pi.fontSize * pi.gapBetweenLabelAndData
    ),
    hadBreak: position.hadBreak,
    nr: position.nr + 1,
    pending: position.nr
      ? _.concat(position.pending, [
          {
            x:
              pi.minX +
              (position.rowFill - pi.gapBetweenCells / 2) * (pi.maxX - pi.minX),
          },
        ])
      : position.pending,
  }
}

export function mkText(
  pi: PageInfo,
  str: string,
  _command: RenderCommand,
  npos: { x: number; y: number },
  position: Row,
  rowSize: number,
  options?: {
    scale?: number
    bold?: true
    lineHeight?: number
    silent?: boolean
  }
): Row {
  const x = (pi.indent + position.rowFill) * (pi.maxX - pi.minX)
  const p = text(pi, str, {
    scale: (options && options.scale) || pi.md,
    x: x,
    y: npos.y + pi.fontSize * pi.gapBetweenLabelAndData,
    bold: (options && options.bold) || false,
    maxW:
      (rowSize - pi.indent * 2 - pi.gapBetweenCells / 2) * (pi.maxX - pi.minX),
    lineHeight: (options && options.lineHeight) || undefined,
    silent: (options && options.silent) || undefined,
  })
  return {
    x: 0,
    y: position.y,
    rowFill: position.rowFill + rowSize,
    rowHeight: Math.max(position.rowHeight, p.y - position.y),
    hadBreak: position.hadBreak,
    nr: position.nr + 1,
    pending: position.nr
      ? _.concat(position.pending, [
          {
            x:
              pi.minX +
              (position.rowFill - pi.gapBetweenCells / 2) * (pi.maxX - pi.minX),
          },
        ])
      : position.pending,
  }
}

export function renderRowLines(
  pi: PageInfo,
  position: Row,
  onlyOutline: boolean
): Row {
  const lineBetweenY =
    pi.maxY -
    (position.y + position.rowHeight + (pi.gapBetweenRows / 2) * pi.fontSize)
  line(
    pi,
    {
      x: pi.minX,
      y: lineBetweenY,
    },
    {
      x: pi.maxX,
      y: lineBetweenY,
    },
    position.thickSeparator ? 2 : 0.1,
    onlyOutline
  )
  _.map(position.pending, p => {
    line(
      pi,
      { x: p.x, y: lineBetweenY },
      { x: p.x, y: pi.maxY - position.y - 10 },
      0.1,
      onlyOutline
    )
  })
  return { ...position, thickSeparator: false }
}
