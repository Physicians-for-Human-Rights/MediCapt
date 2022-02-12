import React, { useRef } from 'react'
import { StyleSheet } from 'react-native'
import styles_ from '../styles'

import {
  Box,
  VStack,
  StatusBar,
  ScrollView,
  HStack,
  Pressable,
  Icon,
  Image,
  Text,
  Hidden,
  useColorMode,
  IconButton,
  Divider,
  Menu,
  Avatar,
  Button,
  Input,
  Center,
  useBreakpointValue,
  Modal,
  View,
} from 'native-base'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'

// https://www.npmjs.com/package/react-native-signature-canvas
import SignatureCanvas from 'react-native-signature-canvas'

const canvasWebStyle = `.m-signature-pad {box-shadow: none; border: none; }
                            .m-signature-pad--body {border: none;}
                            .m-signature-pad--footer {display: none; margin: 0px;}
                            body,html {
                                width: 100%; height: 100%;}`

function Signature({
  imageURI,
  openSignature,
  closeSignature,
  isOpenSignature,
  setSignature,
}) {
  const ref = useRef()

  const onSave = signature => {
    setSignature(signature)
    closeSignature()
  }

  const onSaveButton = () => {
    ref.current.readSignature()
  }

  const onCancel = () => {
    setSignature(null)
    closeSignature()
  }

  const onEmpty = () => {
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
            <Box h="210px" w="410px" p={0}>
              <SignatureCanvas
                androidHardwareAccelerationDisabled={true}
                webStyle={canvasWebStyle}
                ref={ref}
                onOK={onSave}
                onEmpty={onEmpty}
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
