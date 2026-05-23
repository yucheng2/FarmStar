import type {
  Adoption,
  Caretaker,
  CaretakerFilters,
  CreateAdoptionInput,
  CreateAdoptionResult,
  Field,
  FieldFilters,
  PaginatedResult
} from '../types/garden'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000'

type RequestOptions = {
  query?: Record<string, string | number | undefined>
  body?: unknown
}

function buildUrl(path: string, query: RequestOptions['query']) {
  const url = new URL(path, apiBaseUrl)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })

  return url.toString()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.query), {
    method: options.body ? 'POST' : 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.message ?? '请求失败')
  }

  return payload as T
}

export async function getFields(filters: FieldFilters = {}): Promise<PaginatedResult<Field>> {
  return request('/api/fields', { query: filters })
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

export async function createAdoption(input: CreateAdoptionInput): Promise<CreateAdoptionResult> {
  return request('/api/adoptions', { body: input })
}

export async function getAdoptionById(adoptionId: string): Promise<Adoption> {
  return request(`/api/adoptions/${adoptionId}`)
}
