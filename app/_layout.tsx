import { useState, useEffect } from 'react'
import { Stack } from 'expo-router/stack'
import DeviceInfo from 'react-native-device-info'
import { polyfill } from '@/utils'

polyfill()

export default function Layout() {
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    async function getDeviceId() {
      console.log('Getting device id')
      const id = await DeviceInfo.getUniqueId()
      setDeviceId(id)
    }

    getDeviceId()
  }, [])

  console.log(deviceId)

  return <Stack screenOptions={{ header: () => null }} />
}
