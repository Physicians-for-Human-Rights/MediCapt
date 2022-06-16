import React, { useState, useRef } from 'react'
import { Box, Icon, Image, Button, Center, Modal } from 'native-base'
import { AntDesign } from '@expo/vector-icons'
import { disabled, disabledBackground } from 'utils/formRendering/utils'

// https://www.npmjs.com/package/react-native-signature-canvas
import SignatureCanvas, {
  SignatureViewRef,
} from 'react-native-signature-canvas'

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
      <Center bg={isDisabled ? disabledBackground : undefined}>
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
          isDisabled={isDisabled}
          bg="info.500"
          w="100%"
          leftIcon={
            <Icon
              as={AntDesign}
              name={imageURI ? 'closecircleo' : 'edit'}
              size="sm"
            />
          }
          onPress={internalOpen}
        >
          {imageURI ? 'Clear and sign again' : 'Sign'}
        </Button>
      </Center>
      <Modal isOpen={isOpen} onClose={internalClose}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Sign here</Modal.Header>
          <Modal.Body>
            <Box h="210px" w="410px" p={0}>
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
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onCancel}>
                Cancel and clear
              </Button>
              <Button onPress={onSaveButton}>Save</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default Signature
