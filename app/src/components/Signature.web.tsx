import React, { useState, useRef } from 'react'
import { Image, Center, Modal } from 'native-base'
import { disabledBackground } from 'utils/formRendering/utils'
import { View } from 'react-native'
import styles, { layout } from './styles'
// https://www.npmjs.com/package/react-signature-pad-wrapper
import SignatureCanvas from 'react-signature-pad-wrapper'
import { Button, useStyleSheet } from '@ui-kitten/components'
import { CloseCircleIcon, EditIcon } from './Icons'
import themedStyles from 'themeStyled'

const styleS = useStyleSheet(themedStyles)

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

  // code for correctly rendering SignatureCanvas size within it's container
  const signatureRef = useRef<SignatureCanvas>(null)

  const onSave = () => {
    if (signatureRef?.current && !signatureRef.current.isEmpty()) {
      setSignature(signatureRef.current.toDataURL())
    } else {
      setSignature(undefined)
    }
    internalClose()
  }

  const onCancel = () => {
    setSignature(undefined)
    internalClose()
  }

  return (
    <>
      <View
        style={[
          layout.center,
          { backgroundColor: isDisabled ? disabledBackground : 'transparent' },
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
            <View style={styles.signatureWeb}>
              <SignatureCanvas height={200} width={400} ref={signatureRef} />
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
            <Button onPress={onSave}>Save</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default Signature
