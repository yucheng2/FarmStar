import { uni } from '../utils/uni-mock'

const CARETAKER_TOKEN_KEY = 'caretaker_token'
const CARETAKER_INFO_KEY = 'caretaker_info'

export interface CaretakerUser {
  id: string
  name: string
  phone: string
  avatarUrl: string
  village: string
}

export function getCareTakerToken(): string | null {
  return uni.getStorageSync(CARETAKER_TOKEN_KEY) || null
}

export function setCareTakerToken(token: string): void {
  uni.setStorageSync(CARETAKER_TOKEN_KEY, token)
}

export function removeCareTakerToken(): void {
  uni.removeStorageSync(CARETAKER_TOKEN_KEY)
}

export function getCareTakerInfo(): CaretakerUser | null {
  const info = uni.getStorageSync(CARETAKER_INFO_KEY)
  return info ? JSON.parse(info) : null
}

export function setCareTakerInfo(info: CaretakerUser): void {
  uni.setStorageSync(CARETAKER_INFO_KEY, JSON.stringify(info))
}

export function removeCareTakerInfo(): void {
  uni.removeStorageSync(CARETAKER_INFO_KEY)
}

export function logout(): void {
  removeCareTakerToken()
  removeCareTakerInfo()
}

export function isLoggedIn(): boolean {
  return !!getCareTakerToken()
}

// Mock login for demo
export async function caretakerLogin(phone: string, code: string): Promise<CaretakerUser> {
  // Mock: accept any phone starting with 1 and code 123456
  if (!phone.startsWith('1') || phone.length !== 11) {
    throw new Error('手机号格式错误')
  }
  if (code !== '123456') {
    throw new Error('验证码错误')
  }

  // Return mock caretaker (Zhang Shu / 张叔)
  const caretaker: CaretakerUser = {
    id: 'caretaker-zhang',
    name: '张叔',
    phone,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang&backgroundColor=c0aede',
    village: '青禾村'
  }

  setCareTakerToken('mock-caretaker-token-' + Date.now())
  setCareTakerInfo(caretaker)
  return caretaker
}

export async function sendVerifyCode(phone: string): Promise<void> {
  if (!phone.startsWith('1') || phone.length !== 11) {
    throw new Error('手机号格式错误')
  }
  // Mock: always succeed
  return Promise.resolve()
}