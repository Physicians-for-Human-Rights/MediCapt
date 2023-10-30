import React, { useState } from 'react'
import {
  Button,
  useStyleSheet,
  Icon,
  ButtonGroup,
  Text,
  Toggle, // toggle may cause onchange not working properly as not sure what event object passes in
} from '@ui-kitten/components'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'
import themedStyles from '../themeStyled'
import { View } from 'react-native'
import { layout, spacing } from './styles'

const DownloadIcon = props => <Icon name="download" {...props} />
export default function DisplayPDF({
  file,
  width,
  debug,
  toggleDebug,
  mock,
  toggleMock,
  usPageSize,
  toggleUsPageSize,
  downloadPdf,
}) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const styleS = useStyleSheet(themedStyles)

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset)
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  return (
    <View style={[layout.vStack, spacing.py3, { width: width }]}>
      <View style={[layout.hStack, layout.spaceBet, spacing.px10]}>
        <View style={layout.vStack}>
          <Text fontSize="md">Debug</Text>
          <Toggle style={styleS.mr3} checked={debug} onChange={toggleDebug} />
        </View>
        <View style={layout.vStack}>
          <Text style={[styleS.fontSizeMd]}>Mock</Text>
          <Toggle style={styleS.mr3} checked={mock} onChange={toggleMock} />
        </View>
        <View style={layout.vStack}>
          <Text style={[styleS.fontSizeMd]}>
            {usPageSize ? 'Letter' : '  ' + 'A4'}
          </Text>
          <Toggle
            style={styleS.mr3}
            checked={usPageSize}
            onChange={toggleUsPageSize}
          />
        </View>
        <View style={[layout.center, spacing.py3]}>
          <Button
            style={[
              styleS.fontBold,
              styleS.colorCoolGray800,
              styleS.fontSizeMd,
            ]}
            status="info"
            onPress={downloadPdf}
            accessoryLeft={DownloadIcon}
          >
            Download PDF
          </Button>
        </View>
      </View>
      <View style={[layout.hStack, spacing.py1, spacing.px10, layout.spaceBet]}>
        <View style={[layout.center]}>
          <Text
            style={[styleS.fontSizeMd, styleS.truncated, { maxWidth: 100 }]}
          >
            Page {pageNumber} of {numPages}
          </Text>
        </View>
        <View style={layout.hStack}>
          <ButtonGroup status="info" size="medium">
            <Button isDisabled={pageNumber === 1} onPress={previousPage}>
              Previous page
            </Button>
            <Button isDisabled={pageNumber === numPages} onPress={nextPage}>
              Next page
            </Button>
          </ButtonGroup>
        </View>
      </View>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        <Page width={width} pageNumber={pageNumber} />
      </Document>
    </View>
  )
}
