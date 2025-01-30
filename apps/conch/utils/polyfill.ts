import { TextDecoder } from 'text-encoding'
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream'
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch'

export function polyfill() {
  polyfillFetch()
  polyfillReadableStream()
  Object.assign(global, { TextDecoder })
}
