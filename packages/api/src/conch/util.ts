// Base64URL/JWT 유틸
/* eslint-disable no-bitwise, no-plusplus, no-continue */
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
function base64UrlToBase64(input: string): string {
  let output = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = output.length % 4
  if (padLen === 2) output += '=='
  else if (padLen === 3) output += '='
  else if (padLen === 1) throw new Error('Invalid base64url string')
  return output
}
function decodeBase64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '')
  const bytes: number[] = []
  let i = 0
  while (i < clean.length) {
    const enc1 = BASE64_ALPHABET.indexOf(clean.charAt(i++))
    const enc2 = BASE64_ALPHABET.indexOf(clean.charAt(i++))
    const enc3 = BASE64_ALPHABET.indexOf(clean.charAt(i++))
    const enc4 = BASE64_ALPHABET.indexOf(clean.charAt(i++))
    const chr1 = (enc1 << 2) | (enc2 >> 4)
    bytes.push(chr1 & 0xff)
    if (clean.charAt(i - 2) !== '=') {
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
      bytes.push(chr2 & 0xff)
    }
    if (clean.charAt(i - 1) !== '=') {
      const chr3 = ((enc3 & 3) << 6) | enc4
      bytes.push(chr3 & 0xff)
    }
  }
  return new Uint8Array(bytes)
}
function utf8BytesToString(bytes: Uint8Array): string {
  let out = ''
  let i = 0
  while (i < bytes.length) {
    const b0 = bytes[i++]
    if (b0 < 0x80) {
      out += String.fromCharCode(b0)
      continue
    }
    if (b0 < 0xe0) {
      const b1 = bytes[i++] & 0x3f
      out += String.fromCharCode(((b0 & 0x1f) << 6) | b1)
      continue
    }
    if (b0 < 0xf0) {
      const b1 = bytes[i++] & 0x3f
      const b2 = bytes[i++] & 0x3f
      out += String.fromCharCode(((b0 & 0x0f) << 12) | (b1 << 6) | b2)
      continue
    }
    const b1 = bytes[i++] & 0x3f
    const b2 = bytes[i++] & 0x3f
    const b3 = bytes[i++] & 0x3f
    let codepoint = ((b0 & 0x07) << 18) | (b1 << 12) | (b2 << 6) | b3
    codepoint -= 0x10000
    out += String.fromCharCode(0xd800 + ((codepoint >> 10) & 0x3ff))
    out += String.fromCharCode(0xdc00 + (codepoint & 0x3ff))
  }
  return out
}
function base64UrlDecodeToString(input: string): string {
  const bytes = decodeBase64ToBytes(base64UrlToBase64(input))
  return utf8BytesToString(bytes)
}
export function decodeJwtPayload(token: string): any | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  const json = base64UrlDecodeToString(parts[1])
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}
/* eslint-enable no-bitwise, no-plusplus, no-continue */
