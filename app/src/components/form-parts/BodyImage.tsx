import React, { useState } from 'react'
import { Box, Icon, Button, Center, Modal } from 'native-base'
import { ImageAnnotation } from 'utils/types/record'
import BodyMarker from 'components/BodyMarker'
import { useWindowDimensions } from 'react-native'
import { disabledBackground } from 'utils/formRendering/utils'
import { AntDesign } from '@expo/vector-icons'
import { t } from 'i18n-js'
import _ from 'lodash'

function BodyImage({
  imageURI,
  annotations,
  addMarkerData,
  removeMarkerData,
  isDisabled,
}: {
  imageURI: string
  annotations: ImageAnnotation[]
  addMarkerData: (marker: ImageAnnotation, index: number | null) => void
  removeMarkerData: (n: number) => void
  isDisabled: boolean
}) {
  const window = useWindowDimensions()
  const modalSize = Math.min(window.height, window.width)

  const [isOpen, setOpen] = useState(false)

  const image =
    imageURI ||
    'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg'

  const internalClose = () => {
    setOpen(false)
  }
  const internalOpen = () => {
    setOpen(true)
  }

  return (
    <>
      <Center bg={isDisabled ? disabledBackground : undefined}>
        <Box h="200px" w="200px">
          <BodyMarker
            baseImage={image}
            annotations={annotations}
            onCoverPress={internalOpen}
            isDisabled={isDisabled}
          />
        </Box>
        <Button
          isDisabled={isDisabled}
          mt={2}
          colorScheme="blue"
          w="100%"
          size="md"
          leftIcon={<Icon as={AntDesign} name={'edit'} size="sm" />}
          onPress={internalOpen}
        >
          {t('form.mark-diagram')}
        </Button>
      </Center>
      <Modal isOpen={isOpen} onClose={internalClose} size="full">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>{t('form.mark-diagram')}</Modal.Header>
          <Modal.Body>
            <Center flex={1}>
              <Box h={modalSize * 0.7} w={modalSize * 0.7}>
                <BodyMarker
                  isDisabled={false}
                  baseImage={image}
                  annotations={annotations}
                  onAnnotate={addMarkerData}
                  onDeleteAnnotation={removeMarkerData}
                />
              </Box>
            </Center>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button onPress={internalClose}>Save</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default BodyImage
