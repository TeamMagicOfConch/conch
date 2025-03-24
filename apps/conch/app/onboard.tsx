import { Colors } from '@conch/assets/colors'
import { PrimaryButton } from '@conch/components'
import { register, setTokens, validateInput } from '@conch/utils'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { SafeAreaView, View, Text, TextInput, Linking, StyleSheet, Pressable, Keyboard, LayoutChangeEvent } from 'react-native'

export default function OnboardScreen({ setNeedOnboard, onLayout }: { setNeedOnboard: Dispatch<SetStateAction<boolean>>; onLayout: () => void }) {
  const [username, setUsername] = useState('')
  const [initialReviewCount, setInitialReviewCount] = useState<number | undefined>()
  const [error, setError] = useState({ username: '', initialReviewCount: '' })
  const [disabled, setDisabled] = useState(true)

  const openURL = useCallback((url: string) => () => Linking.openURL(url), [])

  const onPress = useCallback(async () => {
    const response = await register({ username, initialReviewCount })
    const {
      data: { accessToken = null, refreshToken = null, username: usernameRes = null },
    } = response || {}
    if (accessToken && refreshToken && username) {
      setTokens({ accessToken, refreshToken, username: usernameRes })
      setNeedOnboard(false)
    }
  }, [setNeedOnboard, username, initialReviewCount])

  useEffect(() => {
    const isValidUsername = validateInput(username)
    const isValidInitialReviewCount = initialReviewCount !== undefined && initialReviewCount >= 0 && initialReviewCount <= 31
    if (isValidUsername && isValidInitialReviewCount) {
      setDisabled(false)
    } else setDisabled(true)
    setError({
      username: !username || isValidUsername ? '' : '*한글 / 영어 / 숫자 10자 이내로 입력하세요',
      initialReviewCount: !initialReviewCount || Number.isNaN(initialReviewCount) || isValidInitialReviewCount ? '' : '*0~30 사이의 정수를 입력하세요',
    })
  }, [username, initialReviewCount])

  return (
    <SafeAreaView
      onLayout={onLayout}
      style={{ flex: 1 }}
    >
      <Pressable
        onPress={Keyboard.dismiss}
        style={style.root}
      >
        <View style={style.container}>
          <Text style={style.title}>🐚 소라에게 뭐라고 불리고 싶나요?</Text>
          <View style={style.inputContainer}>
            <TextInput
              style={style.input}
              placeholder="닉네임 (한글 / 영어 / 숫자 최대 10자)"
              value={username}
              onChange={(e) => setUsername(e.nativeEvent.text)}
            />
          </View>
          {error.username && <Text style={style.error}>{error.username}</Text>}
        </View>
        <View style={style.container}>
          <Text style={style.title}>✍️ 평소 한 달 평균{'\n'}회고 작성 횟수를 알려주세요</Text>
          <View style={style.inputContainer}>
            <TextInput
              style={style.input}
              keyboardType="numeric"
              placeholder="0~30 사이의 정수를 입력하세요"
              value={String(initialReviewCount !== undefined ? initialReviewCount : '')}
              onChange={(e) => setInitialReviewCount(e.nativeEvent.text === '' ? undefined : parseInt(e.nativeEvent.text, 10) || 0)}
            />
          </View>
          {error.initialReviewCount && <Text style={style.error}>{error.initialReviewCount}</Text>}
        </View>
        <View style={style.bottomContainer}>
          <View style={style.descriptionContainer}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={style.description}
            >
              시작하기 버튼을 누르시면{' '}
              <Text
                style={style.link}
                onPress={openURL('https://magicofconch.notion.site/11de5767cbb480038426c22fcaca8871?pvs=4')}
              >
                서비스 이용약관
              </Text>{' '}
              및{' '}
              <Text
                style={style.link}
                onPress={openURL('https://magicofconch.notion.site/11de5767cbb48082971dc9e739d2bbb5?pvs=4')}
              >
                개인정보 처리방침
              </Text>
              에
            </Text>
            <Text style={[style.description, { marginTop: 7 }]}>동의하는 것으로 간주되오니, 이용 전에 확인하시기 바랍니다.</Text>
          </View>
          <PrimaryButton
            disabled={disabled}
            onPress={onPress}
          >
            소라의 마법 시작하기
          </PrimaryButton>
          <View style={style.infoContainer}>
            <Text
              style={[style.info, { fontWeight: 'bold' }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              현재 하나의 기기에서만 서비스 이용이 가능하여,
            </Text>
            <Text
              style={style.info}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              다른 기기에서 생성한 데이터나 콘텐츠를{' '}
              <Text
                style={{ color: Colors.fSoraBold, fontWeight: 'bold' }}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                동기화할 수 없습니다.
              </Text>
            </Text>
            <Text>{'\n'}</Text>
            <Text style={{ fontSize: 12, color: Colors.lightGrey }}>동기화 기능은 추후 구현될 예정입니다.</Text>
          </View>
        </View>
      </Pressable>
    </SafeAreaView>
  )
}

const style = StyleSheet.create({
  root: {
    flex: 1,
    padding: 35,
  },
  container: {
    marginBottom: 50,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    lineHeight: 27,
  },
  error: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.fSoraBold,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 10,
    marginTop: 20,
    padding: 17,
    paddingLeft: 22,
  },
  input: {
    color: Colors.lightGrey,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 35,
    left: 35,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginTop: -7,
    marginBottom: 30,
  },
  description: {
    color: Colors.lightGrey,
  },
  link: {
    color: Colors.sora,
  },
  infoContainer: {
    marginTop: 45,
    padding: 32,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.lightGrey,
    backgroundColor: Colors.bgGrey,
  },
  info: {
    fontSize: 14,
    color: Colors.writtenGrey,
    lineHeight: 24.5,
  },
})
