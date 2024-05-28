import { useState, useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useLogin } from '@/components/hooks'
import { getApiUrlWithPathAndParams } from '@/utils'
import type { RawReview } from '@/types/review'

export interface ReviewData {
  body: RawReview['diary_text']
  responseType: RawReview['response_type']
  responseBody: RawReview['response_text']
}

export function useReviewData() {
  const [review, setReview] = useState<ReviewData>({
    body: mockReviewBody,
    responseType: 'feeling',
    responseBody: mockResponseBody,
  })
  const { userId } = useLogin()
  const { date } = useLocalSearchParams()

  const url = getApiUrlWithPathAndParams({ path: '/diary', params: { date: String(date), user_id: userId } })

  useEffect(() => {
    // fetch review data with url and store it to review
    if (!userId || !date) return
    fetch(url)
      .then((response) => response.json())
      .then((rawReview) => {
        if (rawReview !== undefined && rawReview?.detail !== 'Not found.') {
          setReview({
            body: rawReview.diary_text,
            responseType: rawReview.response_type,
            responseBody: rawReview.response_text,
          })
        }
      })
      .catch(() => {
        // do nothing
      })
  }, [url, userId, date])

  return { review }
}

const mockReviewBody = `풀이 생명을 미인을 것이다. 바이며, 청춘의 위하여 황금시대다. 얼음 그들은 같은 피어나기 봄바람이다. 수 길지 이상의 위하여, 구하기 하는 피어나기 인간에
황금시대다. 청춘 광야에서 주는 위하여, 이상은 구할 이상을 그들은 이것이다. 착목한는 과실이 자신과 사막이다. 실현에 용감하고 튼튼하며, 인간은 운다.
있는 어디 이것은 가는 칼이다. 타오르고 그것은 뜨거운지라, 황금시대다.소금이라 가치를 이것은 이것이다. 뜨고, 설레는 꾸며 그러므로 같이, 피다.
천자만홍이 피는 심장은 속에서 미인을 듣는다. 주며, 밝은 얼마나 이 풀이 우리의 싶이 쓸쓸하랴? 창공에 이 굳세게 유소년에게서 힘있다. 노년에게서 가치를
천지는 피가 이성은 같이 말이다. 우리 따뜻한 같이 역사를 날카로우나 피고, 같은 끝에 운다. 구할 미인을 길지 심장은 인생에 같이 작고 같이, 못할 쓸쓸하랴?
인생을 타오르고 일월과 끓는 그들의 있는 석가는 것이다. 과실이 그러므로 거선의 있는 못할 말이다.내는 많이 바로 생명을 따뜻한 뿐이다. 따뜻한 구하기
소리다.이것은 옷을 때문이다. 소금이라 불러 얼마나 가지에 바이며, 동산에는 말이다. 바로 보배를 인도하겠다는 그들은 칼이다. 꽃 황금시대를 봄바람을
관현악이며, 때문이다. 이것을 끝까지 소리다. 이것은 위하여, 인간에 하였으며, 이것이다. 피가 찬미를 공자는 시들어 고동을 못할 착목한는 살았으며, 말이다.
우리 이성은 길지 그와 황금시대다. 하는 예가 가슴에 설산에서 불러 가치를 있는 있으랴? 그것은 설산에서 낙원을 밝은 군영과 대중을 그들의 말이다. 역사를
많이 끝에 그들에게 우리는 내는 청춘의 능히 사막이다. 풀이 생명을 미인을 것이다. 바이며, 청춘의 위하여 황금시대다. 얼음 그들은 같은 피어나기
봄바람이다. 수 길지 이상의 위하여, 구하기 하는 피어나기 인간에 황금시대다. 청춘 광야에서 주는 위하여, 이상은 구할 이상을 그들은 이것이다. 착목한는
과실이 자신과 사막이다. 실현에 용감하고 튼튼하며, 인간은 운다. 있는 어디 이것은 가는 칼이다. 타오르고 그것은 뜨거운지라, 황금시대다.소금이라 가치를
이것은 이것이다. 뜨고, 설레는 꾸며 그러므로 같이, 피다. 천자만홍이 피는 심장은 속에서 미인을 듣는다. 주며, 밝은 얼마나 이 풀이 우리의 싶이 쓸쓸하랴?
창공에 이 굳세게 유소년에게서 힘있다. 노년에게서 가치를 천지는 피가 이성은 같이 말이다. 우리 따뜻한 같이 역사를 날카로우나 피고, 같은 끝에 운다. 구할



미인을 길지 심장은 인생에 같이 작고 같이, 못할 쓸쓸하랴? 인생을 타오르고 일월과 끓는 그들의 있는 석가는 것이다. 과실이 그러므로 거선의 있는 못할

말이다.내는 많이 바로 생명을 따뜻한 뿐이다. 따뜻한 구하기 소리다.이것은 옷을 때문이다. 소금이라 불러 얼마나 가지에 바이며, 동산에는 말이다. 바로
보배를 인도하겠다는 그들은 칼이다. 꽃 황금시대를 봄바람을 관현악이며, 때문이다. 이것을 끝까지 소리다. 이것은 위하여, 인간에 하였으며, 이것이다. 피가
찬미를 공자는 시들어 고동을 못할 착목한는 살았으며, 말이다. 우리 이성은 길지 그와 황금시대다. 하는 예가 가슴에 설산에서 불러 가치를 있는 있으랴?
그것은 설산에서 낙원을 밝은 군영과 대중을 그들의 말이다. 역사를 많이 끝에 그들에게 우리는 내는 청춘의 능히 사막이다.`

const mockResponseBody = `풀이 생명을 미인을 것이다. 바이며, 청춘의 위하여 황금시대다. 얼음 그들은 같은 피어나기 봄바람이다. 수 길지 이상의 위하여, 구하기 하는 피어나기 인간에
황금시대다. 청춘 광야에서 주는 위하여, 이상은 구할 이상을 그들은 이것이다. 착목한는 과실이 자신과 사막이다. 실현에 용감하고 튼튼하며, 인간은 운다.
있는 어디 이것은 가는 칼이다. 타오르고 그것은 뜨거운지라, 황금시대다.소금이라 가치를 이것은 이것이다. 뜨고, 설레는 꾸며 그러므로 같이, 피다.
천자만홍이 피는 심장은 속에서 미인을 듣는다. 주며, 밝은 얼마나 이 풀이 우리의 싶이 쓸쓸하랴? 창공에 이 굳세게 유소년에게서 힘있다. 노년에게서 가치를
천지는 피가 이성은 같이 말이다. 우리 따뜻한 같이 역사를 날카로우나 피고, 같은 끝에 운다. 구할 미인을 길지 심장은 인생에 같이 작고 같이, 못할 쓸쓸하랴?
인생을 타오르고 일월과 끓는 그들의 있는 석가는 것이다. 과실이 그러므로 거선의 있는 못할 말이다.내는 많이 바로 생명을 따뜻한 뿐이다. 따뜻한 구하기
소리다.이것은 옷을 때문이다. 소금이라 불러 얼마나 가지에 바이며, 동산에는 말이다. 바로 보배를 인도하겠다는 그들은 칼이다. 꽃 황금시대를 봄바람을
관현악이며, 때문이다. 이것을 끝까지 소리다. 이것은 위하여, 인간에 하였으며, 이것이다. 피가 찬미를 공자는 시들어 고동을 못할 착목한는 살았으며, 말이다.`
