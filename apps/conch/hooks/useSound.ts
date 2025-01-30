import { useState, useEffect } from 'react'
import { Audio } from 'expo-av'

export function useSound() {
  const [sound, setSound] = useState<Audio.Sound>()
  const [toggleFadeOut, setToggleFadeOut] = useState(false)

  async function playSound() {
    console.log('Loading Sound')
    const { sound } = await Audio.Sound.createAsync(require('@conch/assets/write-sound.mp3'))
    setSound(sound)

    console.log('Playing Sound')
    await sound.playAsync()
  }

  useEffect(() => {
    async function fadeOut() {
      if (sound && toggleFadeOut) {
        try {
          const interval = setInterval(async () => {
            const soundStatus = await sound?.getStatusAsync()
            if (soundStatus?.isLoaded) {
              const { volume } = soundStatus
              console.log('fade out in progress:', volume)
              await sound.setVolumeAsync(volume * 0.7)
              if (volume * 0.7 < 0.01) {
                clearInterval(interval)
              }
            }
          }, 100)
        } catch (e) {
          console.log(e)
        }
      }
    }

    fadeOut()

    return () => {
      sound?.unloadAsync()
    }
  }, [toggleFadeOut])

  return {
    playSound,
    setToggleFadeOut,
  }
}
