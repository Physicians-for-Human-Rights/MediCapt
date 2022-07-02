import React, { useState } from 'react'
import {
  HStack,
  VStack,
  Button,
  View,
  Icon,
  Select,
  CheckIcon,
  CloseIcon,
  Tooltip,
  Popover,
} from 'native-base'
import type { LocationType } from 'utils/types/location'
import { locationEntityTypes } from 'utils/types/location'
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
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import Loading from 'components/Loading'
import { useInfo } from 'utils/errors'
import { createLocation, updateLocation, deleteLocation } from 'api/manager'
import { standardHandler } from 'api/utils'

export default function LocationEditor({
  files,
  location,
  setLocation,
  changed,
  reloadPrevious,
}: {
  files: Record<string, any>
  location: Partial<LocationType>
  setLocation: React.Dispatch<React.SetStateAction<Partial<LocationType>>>
  changed: boolean
  reloadPrevious: React.MutableRefObject<boolean>
}) {
  const [error, warning, success] = useInfo()
  const [waiting, setWaiting] = useState(null as null | string)

  const createMode = !(location.locationUUID && location.locationUUID !== '')

  const standardReporters = { setWaiting, error, warning, success }
  const handleCreateLocation = () =>
    standardHandler(
      standardReporters,
      'Creating location',
      'Location created',
      async () => {
        setLocation(
          await createLocation(
            //@ts-ignore We validate this before the call
            location
          )
        )
        reloadPrevious.current = true
      }
    )

  const submitLocation = (updatedLocation: Partial<LocationType>) =>
    standardHandler(
      standardReporters,
      'Updating location',
      'Location updated',
      async () => {
        setLocation(
          await updateLocation(
            //@ts-ignore We validate this before the call
            updatedLocation
          )
        )
        reloadPrevious.current = true
      }
    )

  const handleDeleteLocation = () =>
    standardHandler(
      standardReporters,
      'Deleting location',
      'Location deleted',
      async () => {
        await deleteLocation(
          //@ts-ignore We validate this before the call
          location
        )
        reloadPrevious.current = true
      }
    )

  const handleSubmitLocation = () => submitLocation(location)

  const toggleLocation = () => {
    const newLocation = { ...location, enabled: !location.enabled }
    setLocation(newLocation)
    submitLocation(newLocation)
    reloadPrevious.current = true
  }

  return (
    <>
      <VStack>
        <FloatingLabelInput
          label={t('location.full-official-name')}
          value={location.legalName}
          setValue={v => setLocation({ ...location, legalName: v })}
          mt={10}
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
                // @ts-ignore this value comes from location.entityType, which is correct
                setLocation({ ...location, entityType: itemValue })
              }
            }}
          >
            {locationEntityTypes.map((e, i) => (
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
            mx={3}
            mt={1}
            mb={3}
          />
          <Language
            placeholder={t('location.select-default-language')}
            value={location.language}
            setValue={v => setLocation({ ...location, language: v })}
            mx={3}
            mt={1}
            mb={3}
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
            value={location.tags ? _.join(Array.from(location.tags), ' ') : ''}
            setValue={v =>
              setLocation({ ...location, tags: new Set(_.split(v, / |,/)) })
            }
          />
          <View w="45%">
            <NecessaryItem
              isDone={location.enabled || false}
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
              onPress={handleCreateLocation}
            >
              {t('location.create-location')}
            </Button>
          </HStack>
        ) : (
          <HStack mt={5} justifyContent="space-between">
            <Button
              leftIcon={<Icon as={MaterialIcons} name="save" size="sm" />}
              colorScheme="green"
              onPress={handleSubmitLocation}
            >
              {t('location.submit-location')}
            </Button>
            {false && (
              // TODO We don't allow location deletion anymore
              <Button
                leftIcon={<Icon as={MaterialIcons} name="delete" size="sm" />}
                onPress={handleDeleteLocation}
              >
                {t('location.delete-location')}
              </Button>
            )}
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
                onPress={toggleLocation}
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
