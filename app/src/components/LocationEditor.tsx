import React, { useState } from 'react'
import {
  HStack,
  VStack,
  Button,
  Badge,
  View,
  Icon,
  Select,
  CheckIcon,
  CloseIcon,
  Tooltip,
  Popover,
  Spinner,
} from 'native-base'
import type { LocationType } from 'utils/types/location'
import { locationSchema, locationCreationSchema } from 'utils/types/location'
import FloatingLabelInput from 'components/FloatingLabelInput'
import NecessaryItem from 'components/NecessaryItem'
import { t } from 'i18n-js'
import _ from 'lodash'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons'
import AnyCountry from './AnyCountry'
import Language from 'components/Language'
import Loading from 'components/Loading'
import { API } from 'aws-amplify'
import { useInfo, handleStandardErrors } from 'utils/errors'
import { z } from 'zod'
export const entityTypes = [
  'medical-facility',
  'police-station',
  'refugee-camp',
]
import { StyleSheet } from 'react-native'

export default function LocationEditor({
  files,
  location,
  setLocation,
  changed,
}: {
  files: Record<string, any>
  location: Partial<LocationType>
  setLocation: React.Dispatch<React.SetStateAction<Partial<LocationType>>>
  changed: boolean
}) {
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)
  const handleCreate = async () => {
    try {
      locationCreationSchema.parse(location)
      setWaiting('Creating location')
      const data = await API.post('manager', '/manager/location', {
        body: location,
      })
      success('Location created')
      setLocation(locationSchema.parse(data))
    } catch (e) {
      handleStandardErrors(error, warning, success, e)
    } finally {
      setWaiting(null)
    }
  }
  const createMode = !(location.locationUUID && location.locationUUID !== '')

  return (
    <>
      <VStack>
        <FloatingLabelInput
          label={t('location.full-official-name')}
          value={location.legalName}
          setValue={v => setLocation({ ...location, legalName: v })}
        />
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={'Short name'}
            w="100%"
            containerW="45%"
            value={location.shortName}
            setValue={v => setLocation({ ...location, shortName: v })}
          />
          <Select
            size="md"
            selectedValue={location.entityType}
            placeholder={t('location.entity-type')}
            w="95%"
            onValueChange={itemValue => {
              if (itemValue != null) {
                setLocation({ ...location, entityType: itemValue })
              }
            }}
          >
            {entityTypes.map((e, i) => (
              <Select.Item
                size="md"
                key={e}
                label={t('location.entity.' + e)}
                value={e}
              />
            ))}
          </Select>
        </HStack>
        <FloatingLabelInput
          label={t('location.address')}
          value={location.address}
          setValue={v => setLocation({ ...location, address: v })}
        />
        <FloatingLabelInput
          label={t('location.mailing-address')}
          value={location.mailingAddress}
          setValue={v => setLocation({ ...location, mailingAddress: v })}
        />
        <HStack alignItems="center" justifyContent="space-between">
          <AnyCountry
            placeholder={t('location.select-country')}
            value={location.country}
            setValue={v => setLocation({ ...location, country: v })}
          />
          <Language
            placeholder={t('location.select-default-language')}
            value={location.language}
            setValue={v => setLocation({ ...location, language: v })}
          />
        </HStack>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={'Phone number'}
            w="100%"
            containerW="45%"
            value={location.phoneNumber}
            setValue={v => setLocation({ ...location, phoneNumber: v })}
          />
          <FloatingLabelInput
            label={'Email'}
            w="100%"
            containerW="45%"
            value={location.email}
            setValue={v => setLocation({ ...location, email: v })}
          />
        </HStack>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={'Coordinates'}
            w="100%"
            containerW="80%"
            value={location.coordinates}
            setValue={v => setLocation({ ...location, coordinates: v })}
          />
          <Popover
            trigger={triggerProps => {
              return (
                <Button {...triggerProps} colorScheme="warning" m={4}>
                  Help
                </Button>
              )
            }}
          >
            <Popover.Content
              accessibilityLabel="How to get GPS coordinates"
              w="56"
            >
              <Popover.Arrow />
              <Popover.CloseButton />
              <Popover.Header>Getting coordinates</Popover.Header>
              <Popover.Body>
                {t('location.coordinates-instructions')}
              </Popover.Body>
            </Popover.Content>
          </Popover>
        </HStack>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={'Tag (optional)'}
            w="100%"
            containerW="45%"
            value={location.tags}
            setValue={v => setLocation({ ...location, tags: v })}
          />
          <View w="45%">
            <NecessaryItem
              isDone={false}
              todoText="Location is disabled"
              doneText="Location is enabled"
              size={4}
            />
          </View>
        </HStack>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            label={
              t('location.id') +
              ' (' +
              t('location.automatically-created') +
              ')'
            }
            w="100%"
            containerW="45%"
            isReadOnly
            placeholder={
              location.locationID ? location.locationID : 'Not yet created'
            }
          />
          <FloatingLabelInput
            isReadOnly
            label={'Created on (automatic)'}
            placeholder={
              location.createdDate
                ? location.createdDate.toString()
                : 'Not yet created'
            }
            w="100%"
            containerW="45%"
          />
        </HStack>
        <HStack alignItems="center" justifyContent="space-between">
          <FloatingLabelInput
            isReadOnly
            label={'Location version (automatic)'}
            w="100%"
            containerW="45%"
            placeholder={
              location.version ? location.version : 'Not yet created'
            }
          />
          <FloatingLabelInput
            isReadOnly
            label={'Last changed on (automatic)'}
            placeholder={
              location.lastChangedDate
                ? location.lastChangedDate.toString()
                : 'Not yet created'
            }
            w="100%"
            containerW="45%"
          />
        </HStack>
        {createMode ? (
          <HStack mt={5} justifyContent="center">
            <Button
              leftIcon={<Icon as={MaterialIcons} name="save" size="sm" />}
              colorScheme="green"
              onPress={handleCreate}
            >
              {t('location.create-location')}
            </Button>
          </HStack>
        ) : (
          <HStack mt={5} justifyContent="space-between">
            <Button
              leftIcon={<Icon as={MaterialIcons} name="save" size="sm" />}
              colorScheme="green"
            >
              {t('location.submit-location')}
            </Button>
            <Button
              leftIcon={<Icon as={MaterialIcons} name="delete" size="sm" />}
            >
              {t('location.delete-location')}
            </Button>
            <Tooltip openDelay={0} label="Submit first" isDisabled={!changed}>
              <Button
                leftIcon={
                  location.enabled ? (
                    <CloseIcon size={'5'} mx={2} />
                  ) : (
                    <CheckIcon size={'5'} mx={2} />
                  )
                }
                colorScheme={location.enabled ? 'red' : 'green'}
                isDisabled={true}
              >
                {location.enabled
                  ? t('location.disable-location')
                  : t('location.enable-location')}
              </Button>
            </Tooltip>
          </HStack>
        )}
      </VStack>
      <Loading loading={waiting} />
    </>
  )
}

// <View style={spinnerStyle} pointerEvents="none">
//   <Spinner size="lg" />
// </View>
