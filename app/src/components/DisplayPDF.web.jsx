import React, { useState } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  Center,
  Button,
  Pressable,
  Divider,
  Hidden,
  Square,
  Circle,
  Select,
  CheckIcon,
  Switch,
} from 'native-base'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

export default function DisplayPDF({ file, width }) {
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
    <VStack py={3}>
      <HStack justifyContent="space-between">
        <HStack w="35%">
          <Center>
            <Switch size="md" mr={3} />
          </Center>
          <Center>
            <Text fontSize="md">Show fields</Text>
          </Center>
        </HStack>
        <Center w="30%">
          <Text fontSize="md" isTruncated maxW="100px">
            Page {pageNumber} of {numPages}
          </Text>
        </Center>
        <HStack w="35%">
          <Button.Group isAttached colorScheme="blue" size="md">
            <Button isDisabled={pageNumber === 1} onPress={previousPage}>
              Previous page
            </Button>
            <Button isDisabled={pageNumber === numPages} onPress={nextPage}>
              Next page
            </Button>
          </Button.Group>
        </HStack>
      </HStack>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        <Page width={width} pageNumber={pageNumber} />
      </Document>
    </VStack>
  )
}
