import React, { useState } from 'react'
import { Center, Modal } from 'native-base'
import BodyMarker, { BodyMarkerAnnotation } from 'components/BodyMarker'
import { useWindowDimensions } from 'react-native'
import { disabledBackground } from 'utils/formRendering/utils'
import { t } from 'i18n-js'
import _ from 'lodash'
import { View } from 'react-native'
import styles from '../styles'
import { Button, useStyleSheet } from '@ui-kitten/components'
import { EditIcon } from 'components/Icons'
import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)
export type ImageAnnotation = BodyMarkerAnnotation

function BodyImage({
  image,
  annotations,
  addAnnotation: addMarker,
  removeAnnotation: removeMarker,
  isDisabled,
}: {
  image: string
  annotations: ImageAnnotation[]
  addAnnotation: (marker: ImageAnnotation, index: number | null) => any
  removeAnnotation: (n: number) => any
  isDisabled: boolean
}) {
  const window = useWindowDimensions()
  const modalSize = Math.min(window.height, window.width)

  const [isOpen, setOpen] = useState(false)

  const internalClose = () => {
    setOpen(false)
  }
  const internalOpen = () => {
    setOpen(true)
  }

  return (
    <>
      <Center bg={isDisabled ? disabledBackground : undefined}>
        <View style={styles.userListContainer}>
          <BodyMarker
            baseImage={image}
            annotations={annotations}
            onCoverPress={internalOpen}
            isDisabled={isDisabled}
          />
        </View>
        <Button
          disabled={isDisabled}
          style={[styleS.mt2, styleS.width100Percent]}
          status="info"
          size="md"
          accessoryLeft={EditIcon}
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
              <View style={{ height: modalSize * 0.7, width: modalSize * 0.7 }}>
                <BodyMarker
                  isDisabled={false}
                  baseImage={image}
                  annotations={annotations}
                  onAnnotate={addMarker}
                  onDeleteAnnotation={removeMarker}
                />
              </View>
            </Center>
          </Modal.Body>
          <Modal.Footer>
            <Button onPress={internalClose}>Save</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default BodyImage
