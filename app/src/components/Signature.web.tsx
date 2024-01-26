import React, { useState, useRef } from 'react'
import { disabledBackground } from 'utils/formRendering/utils'
import { View, Image } from 'react-native'
import styles, { layout } from './styles'
// https://www.npmjs.com/package/react-signature-pad-wrapper
import SignatureCanvas from 'react-signature-pad-wrapper'
import { Button, useStyleSheet, Modal, Card } from '@ui-kitten/components'
import { CloseCircleIcon, EditIcon } from './Icons'
import themedStyles from '../themeStyled'
import ModalHeader from './styledComponents/ModalHeader'
import { useStoreState } from '../utils/store'

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
  const state = useStoreState()
  const i18n = state?.i18n
  const styleS = useStyleSheet(themedStyles)
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
  const Footer: React.JSX.Element = (
    <>
      <Button
        appearance="ghost"
        status="blueGray"
        onPress={onCancel}
        style={[styleS.mr2]}
      >
        {i18n.t('buttons.cancel-clear')}
      </Button>
      <Button onPress={onSave}>{i18n.t('buttons.save')}</Button>
    </>
  )

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
            style={{ width: 150 }}
            // size={150}
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
        style={{ maxWidth: 400 }}
      >
        <Card
          header={props => (
            <ModalHeader {...props} text={i18n.t('sign.sign-here')} />
          )}
          footer={Footer}
        >
          <View style={styles.signatureWeb}>
            <SignatureCanvas height={200} width={400} ref={signatureRef} />
          </View>
        </Card>
      </Modal>
    </>
  )
}

export default Signature
