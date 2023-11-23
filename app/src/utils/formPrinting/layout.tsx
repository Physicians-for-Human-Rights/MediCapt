import React, { useState, useEffect, useCallback } from 'react'
import _ from 'lodash'
// @ts-ignore typescript doesn't do native/web modules
import { tryConvertToJpeg } from 'utils/imageConverter.web'
import { mapSectionWithPaths, nameFormSections } from 'utils/forms'
import { allFormRenderCommands } from 'utils/formRendering/commands'
import { RenderCommand } from 'utils/formRendering/types'
import formatDate from 'utils/date.ts'
import i18n from 'i18n'
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

export function centerX(
  text: string,
  font: PDFFont,
  fontSize: number,
  minX: number,
  maxX: number
) {
  const c = font.widthOfTextAtSize(text, fontSize)
  return minX + (maxX - minX) / 2 - c / 2
}

export function mkPageInfo(
  page: PDFPage,
  doc: PDFDocument,
  pageSize: [number, number],
  margins: number,
  fonts: { font: PDFFont; fontO: PDFFont; fontB: PDFFont; fontBO: PDFFont },
  skips: { skipTopWithTitle: number; skipTop: number; skipBottom: number },
  indent: number,
  gaps: {
    gapBetweenLabelAndData: number
    gapBetweenRows: number
    gapBetweenCells: number
  },
  debug: boolean,
  fontRel: { h1: number; h2: number; lg: number; md: number; sm: number },
  fontSize: number
): PageInfo {
  const { width, height } = page.getSize()
  const marginSize = width * margins
  const minX = marginSize
  const maxX = width - marginSize
  const minY = marginSize
  const maxY = height - marginSize
  return {
    page,
    pageSize,
    doc,
    width,
    height,
    marginSize,
    minX,
    maxX,
    minY,
    maxY,
    font: fonts.font,
    fontO: fonts.fontO,
    fontB: fonts.fontB,
    fontBO: fonts.fontBO,
    skipTopWithTitle: skips.skipTopWithTitle,
    skipTop: skips.skipTop,
    skipBottom: skips.skipBottom,
    indent,
    gapBetweenLabelAndData: gaps.gapBetweenLabelAndData,
    gapBetweenRows: gaps.gapBetweenRows,
    gapBetweenCells: gaps.gapBetweenCells,
    debug,
    h1: fontRel.h1,
    h2: fontRel.h2,
    lg: fontRel.lg,
    md: fontRel.md,
    sm: fontRel.sm,
    fontSize,
    w: maxX - minX,
    h: maxY - minY,
    pageNumber: 1,
  }
}

export function updatePageInfo(pi: PageInfo, page: PDFPage): PageInfo {
  return { ...pi, page, pageNumber: pi.pageNumber + 1 }
}

export function overflowsPage(pi: PageInfo, row: Row): boolean {
  return (
    row.endPage || row.y + row.rowHeight > pi.maxY - pi.minY - pi.skipBottom
  )
}

export function hasSpaceOnRow(rowSize: number, position: Row) {
  // TODO More checks here since some elements can grow, titles can be too long, etc.
  return !(position.rowFill + rowSize > 1)
}
