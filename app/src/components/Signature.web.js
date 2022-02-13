import React, { useRef } from 'react'
import { Box, Icon, Image, Button, Center, Modal } from 'native-base'
import { AntDesign } from '@expo/vector-icons'

// https://www.npmjs.com/package/react-signature-pad-wrapper
import SignatureCanvas from 'react-signature-pad-wrapper'

function Signature({
  imageURI,
  openSignature,
  closeSignature,
  isOpenSignature,
  setSignature,
}) {
  // code for correctly rendering SignatureCanvas size within it's container
  const signatureRef = useRef()

  const onSave = () => {
    if (!signatureRef.current.isEmpty()) {
      setSignature(signatureRef.current.toDataURL())
    } else {
      setSignature(null)
    }
    closeSignature()
  }

  const onCancel = () => {
    setSignature(null)
    closeSignature()
  }

  return (
    <>
      <Center>
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
          bg="info.500"
          w="100%"
          leftIcon={
            <Icon
              as={AntDesign}
              name={imageURI ? 'closecircleo' : 'edit'}
              size="sm"
            />
          }
          onPress={openSignature}
        >
          {imageURI ? 'Clear and sign again' : 'Sign'}
        </Button>
      </Center>
      <Modal isOpen={isOpenSignature} onClose={closeSignature}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Sign here</Modal.Header>
          <Modal.Body>
            <Box h="210px" w="410px" p={5}>
              <SignatureCanvas height={200} width={400} ref={signatureRef} />
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onCancel}>
                Cancel and clear
              </Button>
              <Button onPress={onSave}>Save</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default Signature
