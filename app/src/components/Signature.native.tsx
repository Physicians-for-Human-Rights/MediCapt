import React, { useState, useRef } from 'react'
import { Image, Center, Modal } from 'native-base'
import { Button, useStyleSheet } from '@ui-kitten/components'
import { disabledBackground } from 'utils/formRendering/utils'
import { View } from 'react-native'
import styles, { layout } from './styles'
// https://www.npmjs.com/package/react-native-signature-canvas
import SignatureCanvas, {
  SignatureViewRef,
} from 'react-native-signature-canvas'
import { EditIcon, CloseCircleIcon } from './Icons'
import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)

const canvasWebStyle = `.m-signature-pad {box-shadow: none; border: none; }
                            .m-signature-pad--body {border: none;}
                            .m-signature-pad--footer {display: none; margin: 0px;}
                            body,html {
                                width: 100%; height: 100%;}`

export type SignatureProps = {
  isDisabled: boolean
  imageURI: string | undefined
  open: () => any
  close: () => any
  setSignature: (signature: string | undefined) => any
}
function Signature({
  isDisabled,
  imageURI,
  open,
  close,
  setSignature,
}: SignatureProps) {
  const [isOpen, setOpen] = useState(false)
  const internalClose = () => {
    setOpen(false)
    close()
  }
  const internalOpen = () => {
    setOpen(true)
    open()
  }

  const ref = useRef<SignatureViewRef>(null)

  const onSave = (signature: string) => {
    setSignature(signature)
    internalClose()
  }

  const onSaveButton = () => {
    ref?.current?.readSignature()
  }

  const onCancel = () => {
    setSignature(undefined)
    internalClose()
  }

  const onEmpty = () => {
    setSignature(undefined)
    internalClose()
  }

  return (
    <>
      <View
        style={[
          layout.center,
          { backgroundColor: isDisabled ? disabledBackground : undefined },
        ]}
      >
        {imageURI && (
          <Image
            resizeMode="contain"
            size={150}
            source={{
              uri: imageURI,
            }}
            alt="The recorded siganture"
          />
        )}
        <Button
          disabled={isDisabled}
          status="info"
          style={[styleS.width100Percent]}
          accessoryLeft={imageURI ? CloseCircleIcon : EditIcon}
          onPress={internalOpen}
        >
          {imageURI ? 'Clear and sign again' : 'Sign'}
        </Button>
      </View>
      <Modal isOpen={isOpen} onClose={internalClose}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Sign here</Modal.Header>
          <Modal.Body>
            <View style={styles.signatureNative}>
              <SignatureCanvas
                androidHardwareAccelerationDisabled={true}
                webStyle={canvasWebStyle}
                ref={ref}
                onOK={onSave}
                onEmpty={onEmpty}
                // NB imageType={'image/jpeg'} is broken!
                // You must get a png instead.
                imageType={'image/png'}
              />
            </View>
          </Modal.Body>
          <Modal.Footer>
            <Button
              appearance="ghost"
              status="blueGray"
              onPress={onCancel}
              style={[styleS.mr2]}
            >
              Cancel and clear
            </Button>
            <Button onPress={onSaveButton}>Save</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default Signature
