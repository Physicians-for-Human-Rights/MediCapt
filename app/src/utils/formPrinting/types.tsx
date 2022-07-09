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

export type Row = {
  x: number
  y: number
  rowFill: number
  rowHeight: number
  hadBreak: boolean
  nr: number
  pending: { x: number }[]
  endPage?: boolean
  thickSeparator?: boolean
}

export type PageInfo = {
  page: PDFPage
  pageSize: [number, number]
  pageNumber: number
  doc: PDFDocument
  debug: boolean
  width: number
  height: number
  marginSize: number
  minX: number
  maxX: number
  minY: number
  maxY: number
  font: PDFFont
  fontO: PDFFont
  fontB: PDFFont
  fontBO: PDFFont
  skipTopWithTitle: number
  skipTop: number
  skipBottom: number
  indent: number
  gapBetweenLabelAndData: number
  gapBetweenRows: number
  gapBetweenCells: number
  h1: number
  h2: number
  lg: number
  md: number
  sm: number
  fontSize: number
  w: number
  h: number
}

export const rowSizeByType = {
  title: 1,
  description: 1,
  divider: 1,
  skip: 1,
  'remove-repeat-button': 1,
  'add-repeat-button': 1,
  padding: 1,
  row: 1,
  'row-with-description': 1,
  address: 0.5,
  'body-image': 1,
  bool: 0.25,
  date: 0.5,
  'date-time': 0.5,
  email: 0.3,
  gender: 0.25,
  list: 1,
  'list-with-labels': 0.3,
  'list-multiple': 1,
  'list-with-labels-multiple': 1,
  'list-with-parts': 1,
  'long-text': 1,
  number: 0.25,
  'phone-number': 0.25,
  photo: 1,
  sex: 0.3,
  signature: 0.3,
  text: 0.5,
  'record-list': 1,
  'share-list': 1,
  'section-heading': 1,
}
