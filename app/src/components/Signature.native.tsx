import React, { useState, useRef } from 'react'
import { Button, useStyleSheet, Modal, Card } from '@ui-kitten/components'
import { disabledBackground } from 'utils/formRendering/utils'
import { View, Image } from 'react-native'
import styles, { layout } from './styles'
// https://www.npmjs.com/package/react-native-signature-canvas
import SignatureCanvas, {
  SignatureViewRef,
} from 'react-native-signature-canvas'
import { EditIcon, CloseCircleIcon } from './Icons'
import themedStyles from '../themeStyled'
import ModalHeader from './styledComponents/ModalHeader'
import i18n from 'i18n'

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
  const styleS = useStyleSheet(themedStyles)
  const [isOpen, setOpen] = useState<boolean>(false)
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
  const Footer = (
    <>
      <Button
        appearance="ghost"
        status="blueGray"
        onPress={onCancel}
        style={[styleS.mr2]}
      >
        {i18n.t('buttons.cancel-clear')}
      </Button>
      <Button onPress={onSaveButton}>{i18n.t('buttons.save')}</Button>
    </>
  )

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
            style={{ width: 150 }}
            source={{
              uri: imageURI,
            }}
            aria-label={i18n.t('sign.recorded-signature')}
          />
        )}
        <Button
          disabled={isDisabled}
          status="info"
          style={[styleS.width100Percent]}
          accessoryLeft={imageURI ? CloseCircleIcon : EditIcon}
          onPress={internalOpen}
        >
          {imageURI ? i18n.t('sign.clear-and-sign') : i18n.t('sign.sign')}
        </Button>
      </View>
      <Modal
        visible={isOpen}
        onBackdropPress={internalClose}
        backdropStyle={styleS.backdrop}
      >
        <Card
          header={props => (
            <ModalHeader {...props} text={i18n.t('sign.sign-here')} />
          )}
          footer={Footer}
        >
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
        </Card>
      </Modal>
    </>
  )
}

export default Signature
