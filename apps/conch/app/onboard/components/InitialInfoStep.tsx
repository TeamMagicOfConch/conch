import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, TextInput, Pressable, Keyboard, StyleSheet, Linking } from 'react-native'
import { Colors } from '@conch/assets/colors'
import { PrimaryButton, SafeAreaViewWithDefaultBackgroundColor } from '@conch/components'
import { validateInput } from '@conch/utils'
import { OnboardStepComponentProps, UserInfo } from './types'

const InitialInfoStep = ({ data, onDataChange, onNext }: OnboardStepComponentProps<UserInfo>) => {
  const [username, setUsername] = useState(data.username)
  const [initialReviewCount, setInitialReviewCount] = useState<number | undefined>(data.initialReviewCount)
  const [error, setError] = useState({ username: '', initialReviewCount: '' })
  const [disabled, setDisabled] = useState(true)

  const openURL = useCallback((url: string) => () => Linking.openURL(url), [])

  // 입력값 유효성 검사
  useEffect(() => {
    const isValidUsername = validateInput(username)
    const isValidInitialReviewCount = initialReviewCount !== undefined && initialReviewCount >= 0 && initialReviewCount <= 31

    if (isValidUsername && isValidInitialReviewCount) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }

    setError({
      username: !username || isValidUsername ? '' : '*한글 / 영어 / 숫자 10자 이내로 입력하세요',
      initialReviewCount: !initialReviewCount || Number.isNaN(initialReviewCount) || isValidInitialReviewCount ? '' : '*0~30 사이의 정수를 입력하세요',
    })

    // 부모 컴포넌트에 데이터 업데이트
    if (username !== data.username || initialReviewCount !== data.initialReviewCount) {
      onDataChange({ username, initialReviewCount })
    }
  }, [username, initialReviewCount, data, onDataChange])

  // 다음 단계로 이동
  const handleNext = () => {
    if (!disabled) {
      onNext()
    }
  }

  return (
    <SafeAreaViewWithDefaultBackgroundColor>
      <Pressable
        onPress={Keyboard.dismiss}
        style={styles.root}
      >
        <View style={styles.container}>
          <Text style={styles.title}>🐚 소라에게 뭐라고 불리고 싶나요?</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="닉네임 (한글 / 영어 / 숫자 최대 10자)"
              value={username}
              onChange={(e) => setUsername(e.nativeEvent.text)}
            />
          </View>
          {error.username && <Text style={styles.error}>{error.username}</Text>}
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>✍️ 평소 한 달 평균{'\n'}회고 작성 횟수를 알려주세요</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0~30 사이의 정수를 입력하세요"
              value={String(initialReviewCount !== undefined ? initialReviewCount : '')}
              onChange={(e) => setInitialReviewCount(e.nativeEvent.text === '' ? undefined : parseInt(e.nativeEvent.text, 10) || 0)}
            />
          </View>
          {error.initialReviewCount && <Text style={styles.error}>{error.initialReviewCount}</Text>}
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.descriptionContainer}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.description}
            >
              시작하기 버튼을 누르시면{' '}
              <Text
                style={styles.link}
                onPress={openURL('https://magicofconch.notion.site/11de5767cbb480038426c22fcaca8871?pvs=4')}
              >
                서비스 이용약관
              </Text>{' '}
              및{' '}
              <Text
                style={styles.link}
                onPress={openURL('https://magicofconch.notion.site/11de5767cbb48082971dc9e739d2bbb5?pvs=4')}
              >
                개인정보 처리방침
              </Text>
              에
            </Text>
            <Text style={[styles.description, { marginTop: 7 }]}>동의하는 것으로 간주되오니, 이용 전에 확인하시기 바랍니다.</Text>
          </View>

          <PrimaryButton
            disabled={disabled}
            onPress={handleNext}
          >
            소라의 마법 시작하기
          </PrimaryButton>

          <View style={styles.infoContainer}>
            <Text
              style={[styles.info, { fontWeight: 'bold' }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              현재 하나의 기기에서만 서비스 이용이 가능하여,
            </Text>
            <Text
              style={styles.info}
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
    </SafeAreaViewWithDefaultBackgroundColor>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flex: 1,
    padding: 25,
    paddingBottom: 0,
  },
  container: {
    marginBottom: 20,
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
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 25,
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
    marginTop: 25,
    padding: 20,
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

export default InitialInfoStep 