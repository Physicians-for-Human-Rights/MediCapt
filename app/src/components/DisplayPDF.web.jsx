import React, { useState } from 'react'
import { HStack, Text, VStack, Center, Switch } from 'native-base'
import { Button, useStyleSheet, Icon, ButtonGroup } from '@ui-kitten/components'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'
import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)
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
    <VStack py={3} width={width}>
      <HStack justifyContent="space-between" px={10}>
        <VStack>
          <Text fontSize="md">Debug</Text>
          <Switch size="md" mr={3} isChecked={debug} onToggle={toggleDebug} />
        </VStack>
        <VStack>
          <Text fontSize="md">Mock</Text>
          <Switch size="md" mr={3} isChecked={mock} onToggle={toggleMock} />
        </VStack>
        <VStack>
          <Text fontSize="md">{usPageSize ? 'Letter' : '  ' + 'A4'}</Text>
          <Switch
            size="md"
            mr={3}
            isChecked={usPageSize}
            onToggle={toggleUsPageSize}
          />
        </VStack>
        <Center py={3}>
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
        </Center>
      </HStack>
      <HStack py={1} justifyContent="space-between" px={10}>
        <Center>
          <Text fontSize="md" isTruncated maxW="100px">
            Page {pageNumber} of {numPages}
          </Text>
        </Center>
        <HStack>
          <ButtonGroup status="info" size="medium">
            <Button isDisabled={pageNumber === 1} onPress={previousPage}>
              Previous page
            </Button>
            <Button isDisabled={pageNumber === numPages} onPress={nextPage}>
              Next page
            </Button>
          </ButtonGroup>
        </HStack>
      </HStack>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        <Page width={width} pageNumber={pageNumber} />
      </Document>
    </VStack>
  )
}
