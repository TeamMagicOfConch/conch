import { useState, useEffect } from 'react'
import { Audio } from 'expo-av'

export function useSound() {
  const [sound, setSound] = useState<Audio.Sound>()

  async function playSound() {
    console.log('Loading Sound')
    const { sound } = await Audio.Sound.createAsync(require('./assets/Hello.mp3'))
    setSound(sound)

    console.log('Playing Sound')
    await sound.playAsync()
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound')
          sound.unloadAsync()
        }
      : undefined
  }, [sound])

  return {
    playSound,
  }
}
