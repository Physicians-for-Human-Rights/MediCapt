import { MMKV } from 'react-native-mmkv'

export const formStorage = new MMKV({
  id: 'form-storage',
})

export const recordStorage = new MMKV({
  id: 'record-storage',
  encryptionKey: 'todo',
})

export const formMetadataStorage = new MMKV({
  id: 'form-metadata-storage',
})

export const recordMetadataStorage = new MMKV({
  id: 'record-metadata-storage',
})

export const locationStorage = new MMKV({
  id: 'location-storage',
})

export const settingsStorage = new MMKV({
  id: 'settings-storage',
})
