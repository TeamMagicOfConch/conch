import { validateInput } from '../string'

describe('validateInput function', () => {
  test('should return true for valid input (English, numbers, Korean, within 10 characters)', () => {
    expect(validateInput('abc123한글')).toBe(true)
    expect(validateInput('abc123')).toBe(true)
    expect(validateInput('1234567890')).toBe(true)
    expect(validateInput('한글1234')).toBe(true)
  })

  test('should return false for input exceeding 10 characters', () => {
    expect(validateInput('abc123한글입니다')).toBe(false) // 11 characters
    expect(validateInput('12345678901')).toBe(false) // 11 characters
  })

  test('should return false for input containing special characters', () => {
    expect(validateInput('abc123!@#')).toBe(false) // special characters
    expect(validateInput('한글#@$')).toBe(false) // special characters
  })

  test('should return false for empty input', () => {
    expect(validateInput('')).toBe(false) // empty string
  })

  test('should return true for minimum valid input', () => {
    expect(validateInput('a')).toBe(true) // 1 character
    expect(validateInput('1')).toBe(true) // 1 character
    expect(validateInput('한')).toBe(true) // 1 character
  })
})
