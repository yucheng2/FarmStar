import { getToken } from './authApi'
import type {
  Adoption,
  AdoptionListItem,
  Caretaker,
  CaretakerFilters,
  CreateAdoptionInput,
  CreateAdoptionResult,
  Field,
  FieldFilters,
  PaginatedResult
} from '../types/garden'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000'

// Simple in-memory cache with TTL
const cache = new Map<string, { data: unknown; expiry: number }>()
const CACHE_TTL_MS = 30_000 // 30 seconds

function getCacheKey(path: string, query?: Record<string, unknown>): string {
  return query ? `${path}?${JSON.stringify(query)}` : path
}

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return undefined
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS })
}

export function clearApiCache(): void {
  cache.clear()
}

type RequestOptions = {
  query?: Record<string, string | number | undefined>
  body?: unknown
  skipCache?: boolean
}

function buildUrl(path: string, query: RequestOptions['query']) {
  const url = new URL(path, apiBaseUrl)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })

  return url.toString()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const cacheKey = getCacheKey(path, options.query)

  // Use cache for GET requests unless skipCache is set
  if (!options.body && !options.skipCache) {
    const cached = getCached<T>(cacheKey)
    if (cached !== undefined) return cached
  }

  const token = getToken()
  const response = await fetch(buildUrl(path, options.query), {
    method: options.body ? 'POST' : 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.message ?? '请求失败')
  }

  // Cache successful GET responses
  if (!options.body) {
    setCache(cacheKey, payload)
  }

  return payload as T
}

export async function getFields(filters: FieldFilters = {}, skipCache?: boolean): Promise<PaginatedResult<Field>> {
  return request('/api/fields', { query: filters, skipCache })
}

export async function getFieldById(fieldId: string): Promise<Field> {
  return request(`/api/fields/${fieldId}`)
}

export async function getRecommendedCaretakers(fieldId: string): Promise<PaginatedResult<Caretaker>> {
  return request(`/api/fields/${fieldId}/recommended-caretakers`)
}

export async function getCaretakers(filters: CaretakerFilters = {}): Promise<PaginatedResult<Caretaker>> {
  return request('/api/caretakers', { query: filters })
}

export async function getCaretakerById(caretakerId: string): Promise<Caretaker> {
  return request(`/api/caretakers/${caretakerId}`)
}

export async function getMyAdoptions(): Promise<PaginatedResult<AdoptionListItem>> {
  return request('/api/adoptions')
}

export async function createAdoption(input: CreateAdoptionInput): Promise<CreateAdoptionResult> {
  const result = await request<CreateAdoptionResult>('/api/adoptions', { body: input })
  // Invalidate adoption cache after creating a new one
  clearApiCache()
  return result
}

export async function getAdoptionById(adoptionId: string): Promise<Adoption> {
  return request(`/api/adoptions/${adoptionId}`)
}

export async function confirmPayment(adoptionId: string): Promise<{ adoptionId: string; status: 'active'; amount: number; paidAt: string }> {
  const result = await request<{ adoptionId: string; status: 'active'; amount: number; paidAt: string }>(`/api/adoptions/${adoptionId}/pay`, { body: {} })
  // Invalidate caches after payment as adoption status changes
  clearApiCache()
  return result
}
