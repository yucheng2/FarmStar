const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000'

export type AuthResponse = {
  user: {
    id: string
    username: string
    createdAt: string
  }
  token: string
}

export function getToken(): string | null {
  return uni.getStorageSync('auth_token') || null
}

export function setToken(token: string): void {
  uni.setStorageSync('auth_token', token)
}

export function removeToken(): void {
  uni.removeStorageSync('auth_token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function getCurrentUserId(): string | null {
  return uni.getStorageSync('user_id') || null
}

export function setCurrentUser(userId: string): void {
  uni.setStorageSync('user_id', userId)
}

async function authRequest<T>(path: string, options: { body?: unknown } = {}): Promise<T> {
  const token = getToken()
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.message ?? '请求失败')
  }

  return payload as T
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const result = await authRequest<AuthResponse>('/api/auth/register', { body: { username, password } })
  setToken(result.token)
  setCurrentUser(result.user.id)
  return result
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const result = await authRequest<AuthResponse>('/api/auth/login', { body: { username, password } })
  setToken(result.token)
  setCurrentUser(result.user.id)
  return result
}

export function logout(): void {
  removeToken()
  uni.removeStorageSync('user_id')
}
