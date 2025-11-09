declare module '*.svg' {
  import { SvgProps } from 'react-native-svg'

  const content: (props: SvgProps) => JSX.Element
  export default content
}
declare module 'react-native-fetch-api'
declare module 'react-native-polyfill-globals/src/readable-stream'
declare module 'react-native-polyfill-globals/src/fetch'
