import React, { useState } from 'react'
import BodyMarker, { BodyMarkerAnnotation } from 'components/BodyMarker'
import { useWindowDimensions } from 'react-native'
import { disabledBackground } from 'utils/formRendering/utils'
import { t } from 'i18n-js'
import _ from 'lodash'
import { View } from 'react-native'
import styles, { layout } from '../styles'
import { Button, useStyleSheet, Modal, Card } from '@ui-kitten/components'
import { EditIcon } from 'components/Icons'
import themedStyles from '../../themeStyled'
import ModalHeader from 'components/styledComponents/ModalHeader'

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
  const styleS = useStyleSheet(themedStyles)
  const window = useWindowDimensions()
  const modalSize = Math.min(window.height, window.width)

  const [isOpen, setOpen] = useState(false)

  const internalClose = () => {
    setOpen(false)
  }
  const internalOpen = () => {
    setOpen(true)
  }
  const Footer = <Button onPress={internalClose}>Save</Button>
  return (
    <>
      <View
        style={[
          layout.center,
          { backgroundColor: isDisabled ? disabledBackground : 'transparent' },
        ]}
      >
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
      </View>
      <Modal
        visible={isOpen}
        onBackdropPress={internalClose}
        backdropStyle={styleS.backdrop}
      >
        <Card
          footer={Footer}
          header={props => (
            <ModalHeader {...props} text={t('form.mark-diagram')} />
          )}
        >
          <View style={[layout.center, layout.flex1]}>
            <View style={{ height: modalSize * 0.7, width: modalSize * 0.7 }}>
              <BodyMarker
                isDisabled={false}
                baseImage={image}
                annotations={annotations}
                onAnnotate={addMarker}
                onDeleteAnnotation={removeMarker}
              />
            </View>
          </View>
        </Card>
      </Modal>
    </>
  )
}

export default BodyImage
