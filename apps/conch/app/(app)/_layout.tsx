import React from 'react'
import { Stack } from 'expo-router/stack'

export default function AppLayout() {
  return <Stack screenOptions={{ header: () => null }} />
}
