import React from 'react'
import { UserType } from 'utils/types/user'
import _ from 'lodash'
import {
  createUser,
  updateUser,
  resetUserPassword,
  confirmUserEmail,
  resendUserConfirmationEmail,
} from 'api/manager'
import { Button, Text } from '@ui-kitten/components'
import { layout, spacing } from './styles'
import { SaveIcon, CheckIcon, LockIcon, CloseIcon } from './Icons'
import { View } from 'react-native'
import { useToast } from 'react-native-toast-notifications'
import { useStoreState } from '../utils/store'
import { standardHandler } from 'api/utils'
import { dataURItoBlob } from 'utils/data'

interface IProps {
  user: Partial<UserType>
  setUser: React.Dispatch<React.SetStateAction<Partial<UserType>>>
  reloadPrevious: React.MutableRefObject<boolean>
  changed: boolean
  isError: boolean
}

async function sendImageLink(user: Partial<UserType>, imageLink: any) {
  if (
    user.official_id_image &&
    !_.startsWith(user.official_id_image, 'https://')
  ) {
    let form = new FormData()
    for (const field in imageLink.fields) {
      form.append(field, imageLink.fields[field])
    }
    form.append('file', dataURItoBlob(user.official_id_image))
    await fetch(imageLink.url, {
      method: 'POST',
      headers: {},
      body: form,
    })
  }
}
const UserEditorActions = (props: IProps) => {
  const { user, setUser, reloadPrevious, changed, isError } = props
  const toast = useToast()
  const state = useStoreState()
  const i18n = state?.i18n
  const createMode = !(user.userUUID && user.userUUID !== '')
  const handleSubmitUser = () => submitUser(user)
  const handleCreateUser = () => {
    if (
      user.formal_name &&
      user.username &&
      user.userType &&
      user.allowed_locations &&
      user.email &&
      user.language &&
      !isError
    ) {
      standardHandler(
        // standardReporters,
        i18n.t('user.system.creatingUser'),
        i18n.t('user.system.userCreated'),
        async () => {
          const r = await createUser(
            //@ts-ignore We validate this before the call
            user
          )
          sendImageLink(user, r.imageLink)
          setUser(r.user)
          reloadPrevious.current = true
        }
      )
    } else {
      toast.show(i18n.t('form.pleaseFillOutAllRequired'), {
        type: 'danger',
        placement: 'bottom',
        duration: 6000,
        animationType: 'slide-in',
      })
    }
  }

  const submitUser = (
    updatedUser: Partial<UserType>,
    inProgressMessage?: string,
    message?: string
  ) =>
    standardHandler(
      // standardReporters,
      inProgressMessage || i18n.t('user.submitting-user'),
      message || i18n.t('user.submitted-user'),
      async () => {
        const r = await updateUser(
          //@ts-ignore We validate this before the call
          updatedUser
        )
        sendImageLink(updatedUser, r.imageLink)
        setUser(r.user)
        reloadPrevious.current = true
      }
    )
  const toggleUser = () => {
    const newUser = { ...user, enabled: !user.enabled }
    setUser(newUser)
    submitUser(newUser)
  }

  const resetPassword = async () =>
    standardHandler(
      // standardReporters,
      i18n.t('user.password-resetting'),
      i18n.t('user.password-reset'),
      async () => {
        await resetUserPassword(user as UserType)
      }
    )

  const confirmEmail = async () =>
    standardHandler(
      // standardReporters,
      i18n.t('user.confirming-email'),
      i18n.t('user.email-confirmed'),
      async () => {
        await confirmUserEmail(user as UserType)
        user.email_verified = 'true'
      }
    )
  const resendConfirmationEmail = async () =>
    standardHandler(
      // standardReporters,
      i18n.t('user.resending-confirmation-email'),
      i18n.t('user.resent-confirmation-email'),
      async () => {
        await resendUserConfirmationEmail(user as UserType)
      }
    )
  return (
    <>
      {createMode ? (
        <View style={[layout.hStack, layout.justifyCenter, spacing.my5]}>
          <Button
            accessoryLeft={SaveIcon}
            status="success"
            onPress={handleCreateUser}
          >
            {i18n.t('user.create-user')}
          </Button>
        </View>
      ) : (
        <View style={[layout.vStack]}>
          <View style={[layout.center]}>
            <View style={[layout.hStack, layout.spaceBet, spacing.my5]}>
              {user.status === 'FORCE_CHANGE_PASSWORD' &&
                user.email_verified !== 'true' && (
                  <Button status="info" onPress={resendConfirmationEmail}>
                    {i18n.t('user.resend-confirmation-email')}
                  </Button>
                )}
              {user.status === 'CONFIRMED' && user.email_verified !== 'true' && (
                <Button
                  accessoryLeft={CheckIcon}
                  status="warning"
                  onPress={confirmEmail}
                >
                  {i18n.t('user.confirm-email')}
                </Button>
              )}
            </View>
          </View>
          <View style={[layout.hStack, layout.spaceBet, spacing.my5]}>
            <Button
              accessoryLeft={SaveIcon}
              status="success"
              onPress={handleSubmitUser}
            >
              {i18n.t('user.submit-user')}
            </Button>
            {user.email_verified === 'true' && (
              <Button
                accessoryLeft={LockIcon}
                status="warning"
                onPress={resetPassword}
              >
                {i18n.t('user.reset-password')}
              </Button>
            )}
            {changed && <Text category="p1">{i18n.t('form.submitFirst')}</Text>}

            <Button
              accessoryLeft={user.enabled ? CloseIcon : CheckIcon}
              status={user.enabled ? 'danger' : 'success'}
              onPress={toggleUser}
            >
              {user.enabled
                ? i18n.t('user.disable-user')
                : i18n.t('user.enable-user')}
            </Button>
          </View>
        </View>
      )}
    </>
  )
}

export default UserEditorActions
