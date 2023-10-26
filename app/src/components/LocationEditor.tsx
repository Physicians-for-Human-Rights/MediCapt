import React, { useState } from 'react'
import {
  Button,
  useStyleSheet,
  Text,
  Popover,
  Card,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components'
import type { LocationType } from 'utils/types/location'
import { locationEntityTypes } from 'utils/types/location'
import FloatingLabelInput from 'components/FloatingLabelInput'
import NecessaryItem from 'components/NecessaryItem'
import { t } from 'i18n-js'
import _ from 'lodash'
import AnyCountry from 'components/AnyCountry'
import Language from 'components/Language'
import Loading from 'components/Loading'
import { useInfo } from 'utils/errors'
import { createLocation, updateLocation, deleteLocation } from 'api/manager'
import { standardHandler } from 'api/utils'
import themedStyles from 'themeStyled'
import { DeleteIcon, SaveIcon, CheckIcon, CloseIcon } from './Icons'
import { layout, spacing } from './styles'
import { View } from 'react-native'
import ModalHeader from './styledComponents/ModalHeader'

const styleS = useStyleSheet(themedStyles)

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
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(
    new IndexPath(0)
  )
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
      <View style={layout.vStack}>
        <FloatingLabelInput
          label={t('location.full-official-name')}
          value={location.legalName}
          setValue={v => setLocation({ ...location, legalName: v })}
          mt={10}
        />
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <FloatingLabelInput
            label={'Short name'}
            w="100%"
            containerW="45%"
            value={location.shortName}
            setValue={v => setLocation({ ...location, shortName: v })}
          />
          <Select
            size="medium"
            style={[styleS.width95Percent]}
            selectedIndex={selectedIndex}
            // selectedValue={location.entityType}
            placeholder={t('location.entity-type')}
            onSelect={index => {
              if (index != null) {
                // @ts-ignore this value comes from location.entityType, which is correct
                const num: number = index.row
                setLocation({
                  ...location,
                  entityType: locationEntityTypes[num],
                })
              }
            }}
          >
            {locationEntityTypes.map((e, i) => (
              <SelectItem
                key={e}
                title={t('location.entity.' + e)}
                // value={e}
              />
            ))}
          </Select>
        </View>
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
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <FloatingLabelInput
            label={'Coordinates'}
            w="100%"
            containerW="80%"
            value={location.coordinates}
            setValue={v => setLocation({ ...location, coordinates: v })}
          />
          <Popover
            anchor={triggerProps => {
              return (
                <Button {...triggerProps} status="warning" m={4}>
                  Help
                </Button>
              )
            }}
            accessibilityLabel="How to get GPS coordinates"
          >
            <Card
              header={props => (
                <ModalHeader {...props} text="Getting coordinates" />
              )}
            >
              {t('location.coordinates-instructions')}
            </Card>
          </Popover>
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
          <FloatingLabelInput
            label={'Tag (optional)'}
            w="100%"
            containerW="45%"
            value={location.tags ? _.join(Array.from(location.tags), ' ') : ''}
            setValue={v =>
              setLocation({ ...location, tags: new Set(_.split(v, / |,/)) })
            }
          />
          <View style={layout.width45percent}>
            <NecessaryItem
              isDone={location.enabled || false}
              todoText="Location is disabled"
              doneText="Location is enabled"
              size="tiny"
            />
          </View>
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        <View style={[layout.hStack, layout.alignCenter, layout.spaceBet]}>
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
        </View>
        {createMode ? (
          <View
            style={[
              layout.hStack,
              layout.justifyCenter,
              spacing.mt5,
              layout.justifyCenter,
            ]}
          >
            <Button
              accessoryLeft={SaveIcon}
              status="success"
              onPress={handleCreateLocation}
            >
              {t('location.create-location')}
            </Button>
          </View>
        ) : (
          <View style={[layout.spaceBet, layout.hStack, spacing.mt5]}>
            <Button
              accessoryLeft={SaveIcon}
              status="success"
              onPress={handleSubmitLocation}
            >
              {t('location.submit-location')}
            </Button>
            {false && (
              // TODO We don't allow location deletion anymore
              <Button accessoryLeft={DeleteIcon} onPress={handleDeleteLocation}>
                {t('location.delete-location')}
              </Button>
            )}
            {changed && <Text category="p1">*Submit first</Text>}
            <Button
              accessoryLeft={location.enabled ? CloseIcon : CheckIcon}
              status={location.enabled ? 'danger' : 'success'}
              onPress={toggleLocation}
            >
              {location.enabled
                ? t('location.disable-location')
                : t('location.enable-location')}
            </Button>
          </View>
        )}
      </View>
      <Loading loading={waiting} />
    </>
  )
}
