import { MMKV } from 'react-native-mmkv'

export const formStorage = new MMKV({
  id: 'form-storage',
})

export const recordStorage = new MMKV({
  id: 'record-storage',
  encryptionKey: 'todo',
})
