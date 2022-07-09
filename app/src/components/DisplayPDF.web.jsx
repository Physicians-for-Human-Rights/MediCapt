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
import { Feather } from '@expo/vector-icons'

export default function DisplayPDF({
  file,
  width,
  debug,
  toggleDebug,
  mock,
  toggleMock,
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
    <VStack py={3}>
      <HStack justifyContent="space-between">
        <HStack w="35%">
          <Center>
            <Switch size="md" mr={3} isChecked={debug} onToggle={toggleDebug} />
          </Center>
          <Center>
            <Text fontSize="md">Debug</Text>
          </Center>
        </HStack>
        <Center py={3}>
          <Button
            fontWeight="bold"
            color="coolGray.800"
            bg="info.500"
            fontSize="md"
            onPress={downloadPdf}
            leftIcon={<Icon as={Feather} name="download-cloud" size="sm" />}
          >
            Download PDF
          </Button>
        </Center>
        <HStack w="35%">
          <Center>
            <Switch size="md" mr={3} isChecked={mock} onToggle={toggleMock} />
          </Center>
          <Center>
            <Text fontSize="md">Mock</Text>
          </Center>
        </HStack>
      </HStack>
      <HStack pt={5} justifyContent="space-between">
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
