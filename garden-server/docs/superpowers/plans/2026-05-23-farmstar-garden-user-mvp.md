# FarmStar Garden User MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the user-facing uni-app MVP for the FarmStar garden flow: browse fields, view caretakers, select a caretaker, create a pending adoption, and show pre-payment confirmation using local mock data.

**Architecture:** This first implementation slice creates a Vue 3 + uni-app frontend with local mock services so the user journey is fully testable before real backend and admin systems exist. Domain types, mock API functions, analytics helpers, and UI components are separated so real REST calls can replace mock functions without rewriting pages.

**Tech Stack:** Vue 3, uni-app, TypeScript, Vite, Vitest, @vue/test-utils, local mock data.

---

## Scope

This plan implements the user端 MVP only:

- Garden list page with search, filters, list/map tab behavior, field cards, and caretaker modal.
- Caretaker selection page with recommended caretakers, all caretakers, selection highlight, and pending adoption creation.
- Payment pre-confirmation page showing the created pending adoption.
- Mock API and analytics modules matching the design spec interfaces.

This plan does not implement the real backend, management admin UI, image upload conversion, payment provider integration, or real chat integration. Those are separate plans because they are independent subsystems with different file structures and test strategies.

## File Structure

Create a uni-app app under the repository root:

- Create: `package.json` — npm scripts and dependencies.
- Create: `tsconfig.json` — TypeScript configuration for Vue and uni-app source files.
- Create: `vite.config.ts` — Vite config with the uni-app plugin.
- Create: `index.html` — H5 dev entry required by Vite.
- Create: `src/main.ts` — Vue 3 SSR app factory used by uni-app.
- Create: `src/App.vue` — app shell.
- Create: `src/manifest.json` — uni-app manifest.
- Create: `src/pages.json` — uni-app page registry and navigation style.
- Create: `src/styles/theme.ts` — shared colors and style constants.
- Create: `src/types/garden.ts` — field, caretaker, adoption, analytics event types.
- Create: `src/mocks/gardenData.ts` — deterministic field and caretaker fixtures.
- Create: `src/services/gardenApi.ts` — mock API functions matching future REST contracts.
- Create: `src/services/analytics.ts` — analytics event capture helper.
- Create: `src/components/FieldCard.vue` — one field card.
- Create: `src/components/CaretakerAvatarCard.vue` — horizontal caretaker item.
- Create: `src/components/CaretakerDetailModal.vue` — reusable caretaker detail popup.
- Create: `src/pages/garden/index.vue` — garden list page.
- Create: `src/pages/caretaker-select/index.vue` — caretaker selection page.
- Create: `src/pages/payment/confirm.vue` — pre-payment confirmation page.
- Create: `tests/setup.ts` — Vitest setup.
- Create: `tests/services/gardenApi.test.ts` — service behavior tests.
- Create: `tests/services/analytics.test.ts` — analytics behavior tests.
- Create: `tests/components/FieldCard.test.ts` — field card component tests.
- Create: `tests/components/CaretakerAvatarCard.test.ts` — caretaker selection card tests.
- Create: `tests/components/CaretakerDetailModal.test.ts` — modal tests.
- Create: `tests/pages/garden.test.ts` — garden page interaction tests.
- Create: `tests/pages/caretakerSelect.test.ts` — caretaker selection page tests.

Use absolute resource paths in uni-app pages and components. The uni-app docs warn that runtime relative paths can resolve differently by page route; use root-based paths such as `/static/farmer-default.webp` for bundled images.

---

### Task 1: Scaffold uni-app project files

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/manifest.json`
- Create: `src/pages.json`
- Create: `src/styles/theme.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Create package manifest**

Create `package.json`:

```json
{
  "name": "farmstar-garden",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev:h5": "uni -p h5",
    "build:h5": "uni build -p h5",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@dcloudio/uni-app": "latest",
    "@dcloudio/uni-h5": "latest",
    "@dcloudio/uni-mp-alipay": "latest",
    "@dcloudio/uni-mp-weixin": "latest",
    "@dcloudio/uni-ui": "latest",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@dcloudio/types": "latest",
    "@dcloudio/uni-cli-shared": "latest",
    "@dcloudio/vite-plugin-uni": "latest",
    "@vitejs/plugin-vue": "latest",
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0",
    "vue-tsc": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create TypeScript configuration**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["@dcloudio/types", "vitest/globals"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "tests/**/*.ts", "vite.config.ts"],
  "references": []
}
```

- [ ] **Step 3: Create Vite config**

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false
  }
})
```

- [ ] **Step 4: Create app entry files**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FarmStar</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Create `src/main.ts`:

```ts
import App from './App.vue'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)

  return {
    app
  }
}
```

Create `src/App.vue`:

```vue
<script setup lang="ts"></script>

<template>
  <slot />
</template>

<style>
page {
  background: #f6fbf3;
  color: #2d3a2d;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
}
</style>
```

- [ ] **Step 5: Create uni-app manifest and pages registry**

Create `src/manifest.json`:

```json
{
  "name": "FarmStar",
  "appid": "__UNI__FARMSTAR",
  "description": "FarmStar garden MVP",
  "versionName": "0.1.0",
  "versionCode": "1",
  "transformPx": false,
  "app-plus": {},
  "mp-weixin": {},
  "mp-alipay": {},
  "h5": {
    "title": "FarmStar"
  }
}
```

Create `src/pages.json`:

```json
{
  "pages": [
    {
      "path": "pages/garden/index",
      "style": {
        "navigationBarTitleText": "我的田园"
      }
    },
    {
      "path": "pages/caretaker-select/index",
      "style": {
        "navigationBarTitleText": "选择管护员"
      }
    },
    {
      "path": "pages/payment/confirm",
      "style": {
        "navigationBarTitleText": "确认认养"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "FarmStar",
    "navigationBarBackgroundColor": "#F6FBF3",
    "backgroundColor": "#F6FBF3"
  }
}
```

- [ ] **Step 6: Create theme constants and test setup**

Create `src/styles/theme.ts`:

```ts
export const theme = {
  gardenGreen: '#4CAF50',
  harvestYellow: '#FFC107',
  skyBlue: '#2196F3',
  textPrimary: '#2D3A2D',
  textSecondary: '#6B766B',
  cardBackground: '#FFFFFF',
  pageBackground: '#F6FBF3',
  border: '#DDE8D8',
  danger: '#D9534F'
} as const
```

Create `tests/setup.ts`:

```ts
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

config.global.stubs = {
  view: { template: '<div><slot /></div>' },
  text: { template: '<span><slot /></span>' },
  image: { template: '<img :src="src" :alt="alt" @click="$emit(\'click\', $event)" />', props: ['src', 'alt'] },
  scroll-view: { template: '<div><slot /></div>' },
  button: { template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>', props: ['disabled'] },
  input: { template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', ($event.target as HTMLInputElement).value)" />', props: ['modelValue'] }
}

const navigateTo = vi.fn()
const showToast = vi.fn()
const showModal = vi.fn()

Object.defineProperty(globalThis, 'uni', {
  value: {
    navigateTo,
    showToast,
    showModal
  },
  writable: true
})
```

- [ ] **Step 7: Install dependencies**

Run:

```bash
npm install
```

Expected: command exits 0 and creates `package-lock.json`.

- [ ] **Step 8: Run tests to verify scaffold**

Run:

```bash
npm test
```

Expected: Vitest exits 1 with a message like `No test files found` because tests are created in later tasks.

- [ ] **Step 9: Commit scaffold**

Run:

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/main.ts src/App.vue src/manifest.json src/pages.json src/styles/theme.ts tests/setup.ts
git commit -m "chore: scaffold uni-app garden MVP"
```

Expected: commit succeeds.

---

### Task 2: Add domain types and mock garden API

**Files:**
- Create: `src/types/garden.ts`
- Create: `src/mocks/gardenData.ts`
- Create: `src/services/gardenApi.ts`
- Test: `tests/services/gardenApi.test.ts`

- [ ] **Step 1: Write failing service tests**

Create `tests/services/gardenApi.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  createAdoption,
  getCaretakerById,
  getCaretakers,
  getFields,
  getRecommendedCaretakers,
  getStoredAdoption
} from '../../src/services/gardenApi'


describe('gardenApi', () => {
  it('filters fields by status and keyword', async () => {
    const result = await getFields({ status: 'idle', keyword: '田地001' })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].code).toBe('田地001')
    expect(result.items[0].status).toBe('idle')
  })

  it('returns recommended caretakers within three kilometers sorted by rating, experience, positive rate, and distance', async () => {
    const result = await getRecommendedCaretakers('field-001')

    expect(result.items.map((caretaker) => caretaker.id)).toEqual(['caretaker-zhang', 'caretaker-li', 'caretaker-wang'])
    expect(result.items.every((caretaker) => caretaker.distanceKm !== undefined && caretaker.distanceKm <= 3)).toBe(true)
  })

  it('filters caretakers by rating, experience, and specialty', async () => {
    const result = await getCaretakers({ ratingMin: 4.5, experienceRange: '5_plus', specialty: 'vegetable' })

    expect(result.items.map((caretaker) => caretaker.id)).toEqual(['caretaker-zhang', 'caretaker-li'])
  })

  it('returns caretaker details by id', async () => {
    const caretaker = await getCaretakerById('caretaker-zhang')

    expect(caretaker.name).toBe('张叔')
    expect(caretaker.realPhotoUrl).toBe('/static/caretakers/zhang-real.webp')
  })

  it('creates a pending payment adoption and stores it for payment confirmation', async () => {
    const adoption = await createAdoption({ fieldId: 'field-001', caretakerId: 'caretaker-zhang' })
    const stored = getStoredAdoption(adoption.adoptionId)

    expect(adoption.status).toBe('pending_payment')
    expect(adoption.nextUrl).toBe('/pages/payment/confirm?adoption_id=adoption-field-001-caretaker-zhang')
    expect(stored?.fieldId).toBe('field-001')
    expect(stored?.caretakerId).toBe('caretaker-zhang')
  })

  it('rejects adoption creation when field is not idle', async () => {
    await expect(createAdoption({ fieldId: 'field-002', caretakerId: 'caretaker-zhang' })).rejects.toThrow('该田地已不可认养')
  })
})
```

- [ ] **Step 2: Run service tests to verify they fail**

Run:

```bash
npm test -- tests/services/gardenApi.test.ts
```

Expected: FAIL because `src/services/gardenApi.ts` does not exist.

- [ ] **Step 3: Create domain types**

Create `src/types/garden.ts`:

```ts
export type FieldStatus = 'idle' | 'adopted' | 'ready_to_harvest' | 'maintenance'
export type CaretakerStatus = 'active' | 'inactive'
export type AdoptionStatus = 'pending_payment' | 'active' | 'completed' | 'cancelled'
export type Specialty = 'vegetable' | 'fruit' | 'grain' | 'general'
export type ExperienceRange = '5_plus' | '3_to_5' | '1_to_3'

export type Crop = {
  id: string
  name: string
  iconUrl: string
  progressPercent: number
}

export type CaretakerSummary = {
  id: string
  name: string
  rating: number
  avatarUrl: string
  distanceKm?: number
  experienceYears: number
  status: CaretakerStatus
}

export type Field = {
  id: string
  code: string
  name: string
  areaSquareMeters: number
  status: FieldStatus
  crop?: Crop
  expectedHarvestDate?: string
  caretaker?: CaretakerSummary
}

export type Caretaker = CaretakerSummary & {
  age: number
  village: string
  specialties: Specialty[]
  reviewCount: number
  completedAdoptionsLast30Days: number
  positiveRate: number
  realPhotoUrl: string
}

export type Adoption = {
  id: string
  userId: string
  fieldId: string
  caretakerId: string
  status: AdoptionStatus
  paymentOrderId: string
  createdAt: string
}

export type FieldFilters = {
  status?: FieldStatus
  cropType?: Specialty
  caretakerRatingMin?: number
  keyword?: string
}

export type CaretakerFilters = {
  ratingMin?: number
  experienceRange?: ExperienceRange
  specialty?: Specialty
  cursor?: string
}

export type PaginatedResult<T> = {
  items: T[]
  pagination: {
    nextCursor?: string
  }
}

export type CreateAdoptionInput = {
  fieldId: string
  caretakerId: string
}

export type CreateAdoptionResult = {
  adoptionId: string
  status: 'pending_payment'
  paymentOrderId: string
  nextUrl: string
}

export type AnalyticsEventName = 'page_view' | 'caretaker_click' | 'caretaker_detail_view' | 'caretaker_select' | 'caretaker_change'

export type AnalyticsEvent = {
  event: AnalyticsEventName
  userId: string
  timestamp: string
  pageName?: string
  fieldId?: string
  caretakerId?: string
  oldCaretakerId?: string
  newCaretakerId?: string
  reason?: string
}
```

- [ ] **Step 4: Create deterministic mock data**

Create `src/mocks/gardenData.ts`:

```ts
import type { Caretaker, Field } from '../types/garden'

export const caretakers: Caretaker[] = [
  {
    id: 'caretaker-zhang',
    name: '张叔',
    age: 56,
    village: '青禾村',
    experienceYears: 18,
    specialties: ['vegetable', 'general'],
    rating: 4.9,
    reviewCount: 128,
    completedAdoptionsLast30Days: 24,
    positiveRate: 98,
    avatarUrl: '/static/caretakers/zhang-avatar.webp',
    realPhotoUrl: '/static/caretakers/zhang-real.webp',
    distanceKm: 1.2,
    status: 'active'
  },
  {
    id: 'caretaker-li',
    name: '李伯',
    age: 61,
    village: '青禾村',
    experienceYears: 12,
    specialties: ['vegetable', 'fruit'],
    rating: 4.8,
    reviewCount: 96,
    completedAdoptionsLast30Days: 19,
    positiveRate: 97,
    avatarUrl: '/static/caretakers/li-avatar.webp',
    realPhotoUrl: '/static/caretakers/li-real.webp',
    distanceKm: 2.4,
    status: 'active'
  },
  {
    id: 'caretaker-wang',
    name: '王大爷',
    age: 64,
    village: '南坡村',
    experienceYears: 21,
    specialties: ['grain', 'general'],
    rating: 4.7,
    reviewCount: 88,
    completedAdoptionsLast30Days: 17,
    positiveRate: 96,
    avatarUrl: '/static/caretakers/wang-avatar.webp',
    realPhotoUrl: '/static/caretakers/wang-real.webp',
    distanceKm: 2.8,
    status: 'active'
  },
  {
    id: 'caretaker-zhao',
    name: '赵叔',
    age: 52,
    village: '东篱村',
    experienceYears: 8,
    specialties: ['fruit'],
    rating: 4.6,
    reviewCount: 64,
    completedAdoptionsLast30Days: 12,
    positiveRate: 95,
    avatarUrl: '/static/caretakers/zhao-avatar.webp',
    realPhotoUrl: '/static/caretakers/zhao-real.webp',
    distanceKm: 4.1,
    status: 'active'
  },
  {
    id: 'caretaker-sun',
    name: '孙伯',
    age: 58,
    village: '青禾村',
    experienceYears: 4,
    specialties: ['vegetable'],
    rating: 4.5,
    reviewCount: 52,
    completedAdoptionsLast30Days: 10,
    positiveRate: 94,
    avatarUrl: '/static/caretakers/sun-avatar.webp',
    realPhotoUrl: '/static/caretakers/sun-real.webp',
    distanceKm: 1.9,
    status: 'active'
  }
]

export const fields: Field[] = [
  {
    id: 'field-001',
    code: '田地001',
    name: '田地001',
    areaSquareMeters: 10,
    status: 'idle',
    expectedHarvestDate: undefined,
    caretaker: caretakers[0]
  },
  {
    id: 'field-002',
    code: '田地002',
    name: '我的小菜园',
    areaSquareMeters: 20,
    status: 'adopted',
    crop: {
      id: 'crop-tomato',
      name: '西红柿',
      iconUrl: '/static/crops/tomato.webp',
      progressPercent: 60
    },
    expectedHarvestDate: '2026-06-15',
    caretaker: caretakers[1]
  },
  {
    id: 'field-003',
    code: '田地003',
    name: '南坡玉米田',
    areaSquareMeters: 30,
    status: 'ready_to_harvest',
    crop: {
      id: 'crop-corn',
      name: '玉米',
      iconUrl: '/static/crops/corn.webp',
      progressPercent: 95
    },
    expectedHarvestDate: '2026-05-28',
    caretaker: caretakers[2]
  },
  {
    id: 'field-004',
    code: '田地004',
    name: '维护田地',
    areaSquareMeters: 15,
    status: 'maintenance',
    expectedHarvestDate: undefined,
    caretaker: caretakers[3]
  }
]
```

- [ ] **Step 5: Create mock API service**

Create `src/services/gardenApi.ts`:

```ts
import { caretakers, fields } from '../mocks/gardenData'
import type {
  Adoption,
  Caretaker,
  CaretakerFilters,
  CreateAdoptionInput,
  CreateAdoptionResult,
  ExperienceRange,
  Field,
  FieldFilters,
  PaginatedResult
} from '../types/garden'

const adoptionStore = new Map<string, Adoption>()

function includesKeyword(field: Field, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const caretakerName = field.caretaker?.name ?? ''
  const cropName = field.crop?.name ?? ''

  return [field.code, field.name, caretakerName, cropName]
    .some((value) => value.toLowerCase().includes(normalizedKeyword))
}

function isInExperienceRange(years: number, range: ExperienceRange) {
  if (range === '5_plus') return years >= 5
  if (range === '3_to_5') return years >= 3 && years <= 5
  return years >= 1 && years <= 3
}

export async function getFields(filters: FieldFilters = {}): Promise<PaginatedResult<Field>> {
  const items = fields.filter((field) => {
    if (filters.status && field.status !== filters.status) return false
    if (filters.cropType && !field.crop?.name) return false
    if (filters.caretakerRatingMin && (field.caretaker?.rating ?? 0) < filters.caretakerRatingMin) return false
    if (filters.keyword && !includesKeyword(field, filters.keyword)) return false
    return true
  })

  return { items, pagination: {} }
}

export async function getFieldById(fieldId: string): Promise<Field> {
  const field = fields.find((item) => item.id === fieldId)
  if (!field) throw new Error('田地不存在')
  return field
}

export async function getRecommendedCaretakers(fieldId: string): Promise<PaginatedResult<Caretaker>> {
  await getFieldById(fieldId)

  const items = caretakers
    .filter((caretaker) => caretaker.status === 'active')
    .filter((caretaker) => caretaker.distanceKm !== undefined && caretaker.distanceKm <= 3)
    .sort((left, right) => {
      if (right.rating !== left.rating) return right.rating - left.rating
      if (right.experienceYears !== left.experienceYears) return right.experienceYears - left.experienceYears
      if (right.positiveRate !== left.positiveRate) return right.positiveRate - left.positiveRate
      return (left.distanceKm ?? 999) - (right.distanceKm ?? 999)
    })
    .slice(0, 5)

  return { items, pagination: {} }
}

export async function getCaretakers(filters: CaretakerFilters = {}): Promise<PaginatedResult<Caretaker>> {
  const items = caretakers.filter((caretaker) => {
    if (caretaker.status !== 'active') return false
    if (filters.ratingMin && caretaker.rating < filters.ratingMin) return false
    if (filters.experienceRange && !isInExperienceRange(caretaker.experienceYears, filters.experienceRange)) return false
    if (filters.specialty && !caretaker.specialties.includes(filters.specialty)) return false
    return true
  })

  return { items, pagination: {} }
}

export async function getCaretakerById(caretakerId: string): Promise<Caretaker> {
  const caretaker = caretakers.find((item) => item.id === caretakerId)
  if (!caretaker) throw new Error('管护员不存在')
  return caretaker
}

export async function createAdoption(input: CreateAdoptionInput): Promise<CreateAdoptionResult> {
  const field = await getFieldById(input.fieldId)
  const caretaker = await getCaretakerById(input.caretakerId)

  if (field.status !== 'idle') throw new Error('该田地已不可认养')
  if (caretaker.status !== 'active') throw new Error('该管护员暂不可选')

  const adoptionId = `adoption-${field.id}-${caretaker.id}`
  const paymentOrderId = `payment-${field.id}-${caretaker.id}`

  adoptionStore.set(adoptionId, {
    id: adoptionId,
    userId: 'user-demo',
    fieldId: field.id,
    caretakerId: caretaker.id,
    status: 'pending_payment',
    paymentOrderId,
    createdAt: '2026-05-23T10:00:00+08:00'
  })

  return {
    adoptionId,
    status: 'pending_payment',
    paymentOrderId,
    nextUrl: `/pages/payment/confirm?adoption_id=${adoptionId}`
  }
}

export function getStoredAdoption(adoptionId: string): Adoption | undefined {
  return adoptionStore.get(adoptionId)
}
```

- [ ] **Step 6: Run service tests**

Run:

```bash
npm test -- tests/services/gardenApi.test.ts
```

Expected: PASS, 6 tests pass.

- [ ] **Step 7: Commit domain and service layer**

Run:

```bash
git add src/types/garden.ts src/mocks/gardenData.ts src/services/gardenApi.ts tests/services/gardenApi.test.ts
git commit -m "feat: add garden mock domain service"
```

Expected: commit succeeds.

---

### Task 3: Add analytics helper

**Files:**
- Create: `src/services/analytics.ts`
- Test: `tests/services/analytics.test.ts`

- [ ] **Step 1: Write failing analytics tests**

Create `tests/services/analytics.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { clearAnalyticsEvents, getAnalyticsEvents, trackEvent } from '../../src/services/analytics'


describe('analytics', () => {
  beforeEach(() => {
    clearAnalyticsEvents()
  })

  it('records analytics event with timestamp', () => {
    trackEvent({ event: 'page_view', userId: 'user-demo', pageName: 'garden' })

    expect(getAnalyticsEvents()).toEqual([
      {
        event: 'page_view',
        userId: 'user-demo',
        pageName: 'garden',
        timestamp: '2026-05-23T10:00:00+08:00'
      }
    ])
  })

  it('keeps caretaker event fields', () => {
    trackEvent({ event: 'caretaker_select', userId: 'user-demo', caretakerId: 'caretaker-zhang', fieldId: 'field-001' })

    expect(getAnalyticsEvents()[0]).toMatchObject({
      event: 'caretaker_select',
      userId: 'user-demo',
      caretakerId: 'caretaker-zhang',
      fieldId: 'field-001'
    })
  })
})
```

- [ ] **Step 2: Run analytics tests to verify they fail**

Run:

```bash
npm test -- tests/services/analytics.test.ts
```

Expected: FAIL because `src/services/analytics.ts` does not exist.

- [ ] **Step 3: Create analytics helper**

Create `src/services/analytics.ts`:

```ts
import type { AnalyticsEvent } from '../types/garden'

type TrackableAnalyticsEvent = Omit<AnalyticsEvent, 'timestamp'> & Partial<Pick<AnalyticsEvent, 'timestamp'>>

const events: AnalyticsEvent[] = []

export function trackEvent(event: TrackableAnalyticsEvent) {
  events.push({
    ...event,
    timestamp: event.timestamp ?? '2026-05-23T10:00:00+08:00'
  })
}

export function getAnalyticsEvents() {
  return [...events]
}

export function clearAnalyticsEvents() {
  events.length = 0
}
```

- [ ] **Step 4: Run analytics tests**

Run:

```bash
npm test -- tests/services/analytics.test.ts
```

Expected: PASS, 2 tests pass.

- [ ] **Step 5: Commit analytics helper**

Run:

```bash
git add src/services/analytics.ts tests/services/analytics.test.ts
git commit -m "feat: add garden analytics tracking"
```

Expected: commit succeeds.

---

### Task 4: Build reusable field card component

**Files:**
- Create: `src/components/FieldCard.vue`
- Test: `tests/components/FieldCard.test.ts`

- [ ] **Step 1: Write failing component tests**

Create `tests/components/FieldCard.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FieldCard from '../../src/components/FieldCard.vue'
import { fields } from '../../src/mocks/gardenData'


describe('FieldCard', () => {
  it('renders idle field and emits adopt action', async () => {
    const wrapper = mount(FieldCard, { props: { field: fields[0] } })

    expect(wrapper.text()).toContain('田地001')
    expect(wrapper.text()).toContain('面积：10㎡')
    expect(wrapper.text()).toContain('空闲')
    expect(wrapper.text()).toContain('立即认养')

    await wrapper.get('[data-test="field-action"]').trigger('click')

    expect(wrapper.emitted('adopt')).toEqual([[fields[0]]])
  })

  it('renders adopted crop progress and emits details action', async () => {
    const wrapper = mount(FieldCard, { props: { field: fields[1] } })

    expect(wrapper.text()).toContain('我的小菜园')
    expect(wrapper.text()).toContain('西红柿')
    expect(wrapper.text()).toContain('60%')
    expect(wrapper.text()).toContain('查看详情')

    await wrapper.get('[data-test="field-action"]').trigger('click')

    expect(wrapper.emitted('details')).toEqual([[fields[1]]])
  })

  it('emits caretaker click when avatar is clicked', async () => {
    const wrapper = mount(FieldCard, { props: { field: fields[0] } })

    await wrapper.get('[data-test="caretaker-avatar"]').trigger('click')

    expect(wrapper.emitted('caretaker')).toEqual([[fields[0].caretaker]])
  })
})
```

- [ ] **Step 2: Run field card tests to verify they fail**

Run:

```bash
npm test -- tests/components/FieldCard.test.ts
```

Expected: FAIL because `src/components/FieldCard.vue` does not exist.

- [ ] **Step 3: Create field card component**

Create `src/components/FieldCard.vue`:

```vue
<script setup lang="ts">
import type { Field } from '../types/garden'

const props = defineProps<{
  field: Field
}>()

const emit = defineEmits<{
  adopt: [field: Field]
  details: [field: Field]
  caretaker: [caretaker: Field['caretaker']]
}>()

const statusText: Record<Field['status'], string> = {
  idle: '空闲',
  adopted: '已认养',
  ready_to_harvest: '待收获',
  maintenance: '维护中'
}

const actionText = props.field.status === 'idle' ? '立即认养' : '查看详情'

function emitAction() {
  if (props.field.status === 'idle') {
    emit('adopt', props.field)
    return
  }

  emit('details', props.field)
}

function emitCaretaker() {
  if (props.field.caretaker) emit('caretaker', props.field.caretaker)
}
</script>

<template>
  <view class="field-card" data-test="field-card">
    <view class="field-main">
      <view class="field-header">
        <text class="field-name">{{ field.name }}</text>
        <image
          v-if="field.caretaker"
          class="caretaker-avatar"
          data-test="caretaker-avatar"
          :src="field.caretaker.avatarUrl"
          :alt="field.caretaker.name"
          @click.stop="emitCaretaker"
        />
      </view>

      <view class="field-meta">
        <text>面积：{{ field.areaSquareMeters }}㎡</text>
        <text class="status" :class="`status-${field.status}`">{{ statusText[field.status] }}</text>
      </view>

      <view v-if="field.crop" class="crop-row">
        <image class="crop-icon" :src="field.crop.iconUrl" :alt="field.crop.name" />
        <text>{{ field.crop.name }}</text>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: `${field.crop.progressPercent}%` }" />
        </view>
        <text>{{ field.crop.progressPercent }}%</text>
      </view>
      <view v-else class="crop-row">
        <text>可种植：蔬菜/水果</text>
      </view>

      <view class="field-footer">
        <text class="harvest">预计收获：{{ field.expectedHarvestDate ?? '--' }}</text>
        <button class="action-button" data-test="field-action" :disabled="field.status === 'maintenance'" @click.stop="emitAction">
          {{ actionText }}
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.field-card {
  min-height: 180px;
  margin: 16px;
  padding: 16px;
  border: 1px solid #dde8d8;
  border-radius: 16px;
  background: #ffffff;
  box-sizing: border-box;
}

.field-header,
.field-meta,
.crop-row,
.field-footer {
  display: flex;
  align-items: center;
}

.field-header,
.field-footer {
  justify-content: space-between;
}

.field-name {
  font-size: 16px;
  font-weight: 700;
  color: #2d3a2d;
}

.caretaker-avatar {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #eef6ea;
  transform: scale(1);
  transition: transform 0.2s ease;
}

.caretaker-avatar:active {
  transform: scale(0.95);
}

.field-meta {
  gap: 12px;
  margin-top: 8px;
  color: #6b766b;
  font-size: 12px;
}

.status {
  padding: 3px 8px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 12px;
}

.status-idle { background: #4caf50; }
.status-adopted { background: #2196f3; }
.status-ready_to_harvest { background: #ffc107; color: #2d3a2d; }
.status-maintenance { background: #9e9e9e; }

.crop-row {
  gap: 8px;
  margin-top: 14px;
  color: #2d3a2d;
  font-size: 13px;
}

.crop-icon {
  width: 24px;
  height: 24px;
}

.progress-track {
  width: 90px;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6eee3;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
}

.field-footer {
  margin-top: 18px;
}

.harvest {
  color: #6b766b;
  font-size: 12px;
}

.action-button {
  min-width: 88px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 13px;
}

.action-button[disabled] {
  background: #b7c5b1;
}
</style>
```

- [ ] **Step 4: Run field card tests**

Run:

```bash
npm test -- tests/components/FieldCard.test.ts
```

Expected: PASS, 3 tests pass.

- [ ] **Step 5: Commit field card**

Run:

```bash
git add src/components/FieldCard.vue tests/components/FieldCard.test.ts
git commit -m "feat: add garden field card"
```

Expected: commit succeeds.

---

### Task 5: Build caretaker avatar card component

**Files:**
- Create: `src/components/CaretakerAvatarCard.vue`
- Test: `tests/components/CaretakerAvatarCard.test.ts`

- [ ] **Step 1: Write failing component tests**

Create `tests/components/CaretakerAvatarCard.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CaretakerAvatarCard from '../../src/components/CaretakerAvatarCard.vue'
import { caretakers } from '../../src/mocks/gardenData'


describe('CaretakerAvatarCard', () => {
  it('renders caretaker summary', () => {
    const wrapper = mount(CaretakerAvatarCard, { props: { caretaker: caretakers[0], selected: false } })

    expect(wrapper.text()).toContain('张叔')
    expect(wrapper.text()).toContain('4.9')
    expect(wrapper.text()).toContain('18年经验')
  })

  it('applies selected class and emits select', async () => {
    const wrapper = mount(CaretakerAvatarCard, { props: { caretaker: caretakers[0], selected: true } })

    expect(wrapper.classes()).toContain('selected')

    await wrapper.trigger('click')

    expect(wrapper.emitted('select')).toEqual([[caretakers[0]]])
  })

  it('emits detail when detail button is clicked', async () => {
    const wrapper = mount(CaretakerAvatarCard, { props: { caretaker: caretakers[0], selected: false } })

    await wrapper.get('[data-test="caretaker-detail"]').trigger('click')

    expect(wrapper.emitted('detail')).toEqual([[caretakers[0]]])
  })
})
```

- [ ] **Step 2: Run avatar card tests to verify they fail**

Run:

```bash
npm test -- tests/components/CaretakerAvatarCard.test.ts
```

Expected: FAIL because `src/components/CaretakerAvatarCard.vue` does not exist.

- [ ] **Step 3: Create caretaker avatar card component**

Create `src/components/CaretakerAvatarCard.vue`:

```vue
<script setup lang="ts">
import type { Caretaker } from '../types/garden'

const props = defineProps<{
  caretaker: Caretaker
  selected: boolean
}>()

const emit = defineEmits<{
  select: [caretaker: Caretaker]
  detail: [caretaker: Caretaker]
}>()

function selectCaretaker() {
  emit('select', props.caretaker)
}

function showDetail() {
  emit('detail', props.caretaker)
}
</script>

<template>
  <view class="caretaker-card" :class="{ selected }" @click="selectCaretaker">
    <image class="avatar" :src="caretaker.avatarUrl" :alt="caretaker.name" />
    <text class="name">{{ caretaker.name }}</text>
    <text class="rating">{{ caretaker.rating.toFixed(1) }} ★</text>
    <text class="experience">{{ caretaker.experienceYears }}年经验</text>
    <button class="detail-button" data-test="caretaker-detail" @click.stop="showDetail">详情</button>
  </view>
</template>

<style scoped>
.caretaker-card {
  width: 92px;
  flex: 0 0 92px;
  margin-right: 12px;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #ffffff;
  text-align: center;
  box-sizing: border-box;
}

.caretaker-card.selected {
  border-color: #4caf50;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background: #eef6ea;
  transform: scale(1);
  transition: transform 0.2s ease;
}

.avatar:active {
  transform: scale(0.95);
}

.name,
.rating,
.experience {
  display: block;
  margin-top: 4px;
}

.name {
  font-size: 13px;
  font-weight: 700;
  color: #2d3a2d;
}

.rating,
.experience {
  color: #6b766b;
  font-size: 12px;
}

.detail-button {
  height: 26px;
  margin-top: 6px;
  padding: 0 8px;
  border: 0;
  border-radius: 999px;
  background: #eef6ea;
  color: #4caf50;
  font-size: 12px;
}
</style>
```

- [ ] **Step 4: Run avatar card tests**

Run:

```bash
npm test -- tests/components/CaretakerAvatarCard.test.ts
```

Expected: PASS, 3 tests pass.

- [ ] **Step 5: Commit caretaker avatar card**

Run:

```bash
git add src/components/CaretakerAvatarCard.vue tests/components/CaretakerAvatarCard.test.ts
git commit -m "feat: add caretaker avatar card"
```

Expected: commit succeeds.

---

### Task 6: Build caretaker detail modal

**Files:**
- Create: `src/components/CaretakerDetailModal.vue`
- Test: `tests/components/CaretakerDetailModal.test.ts`

- [ ] **Step 1: Write failing modal tests**

Create `tests/components/CaretakerDetailModal.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CaretakerDetailModal from '../../src/components/CaretakerDetailModal.vue'
import { caretakers } from '../../src/mocks/gardenData'


describe('CaretakerDetailModal', () => {
  it('does not render when closed', () => {
    const wrapper = mount(CaretakerDetailModal, { props: { open: false, caretaker: caretakers[0] } })

    expect(wrapper.find('[data-test="caretaker-modal"]').exists()).toBe(false)
  })

  it('renders caretaker detail when open', () => {
    const wrapper = mount(CaretakerDetailModal, { props: { open: true, caretaker: caretakers[0] } })

    expect(wrapper.text()).toContain('张叔')
    expect(wrapper.text()).toContain('青禾村')
    expect(wrapper.text()).toContain('18年管护经验')
    expect(wrapper.text()).toContain('近30天完成：24')
    expect(wrapper.text()).toContain('好评率：98%')
  })

  it('emits close and responsible fields actions', async () => {
    const wrapper = mount(CaretakerDetailModal, { props: { open: true, caretaker: caretakers[0] } })

    await wrapper.get('[data-test="responsible-fields"]').trigger('click')
    await wrapper.get('[data-test="close-modal"]').trigger('click')

    expect(wrapper.emitted('responsibleFields')).toEqual([[caretakers[0]]])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits contact action', async () => {
    const wrapper = mount(CaretakerDetailModal, { props: { open: true, caretaker: caretakers[0] } })

    await wrapper.get('[data-test="contact-caretaker"]').trigger('click')

    expect(wrapper.emitted('contact')).toEqual([[caretakers[0]]])
  })
})
```

- [ ] **Step 2: Run modal tests to verify they fail**

Run:

```bash
npm test -- tests/components/CaretakerDetailModal.test.ts
```

Expected: FAIL because `src/components/CaretakerDetailModal.vue` does not exist.

- [ ] **Step 3: Create caretaker detail modal component**

Create `src/components/CaretakerDetailModal.vue`:

```vue
<script setup lang="ts">
import type { Caretaker } from '../types/garden'

const props = defineProps<{
  open: boolean
  caretaker: Caretaker | null
}>()

const emit = defineEmits<{
  close: []
  responsibleFields: [caretaker: Caretaker]
  contact: [caretaker: Caretaker]
}>()

function close() {
  emit('close')
}

function showResponsibleFields() {
  if (props.caretaker) emit('responsibleFields', props.caretaker)
}

function contactCaretaker() {
  if (props.caretaker) emit('contact', props.caretaker)
}
</script>

<template>
  <view v-if="open && caretaker" class="modal-mask" data-test="caretaker-modal">
    <view class="modal-panel">
      <view class="photo-row">
        <image class="photo" :src="caretaker.realPhotoUrl" :alt="`${caretaker.name}真人照片`" />
        <image class="photo" :src="caretaker.avatarUrl" :alt="`${caretaker.name}二次元形象`" />
      </view>

      <view class="info-block">
        <text class="name">{{ caretaker.name }} · {{ caretaker.age }}岁 · {{ caretaker.village }}</text>
        <text class="muted">{{ caretaker.experienceYears }}年管护经验</text>
        <text class="muted">擅长：{{ caretaker.specialties.join(' / ') }}</text>
        <text class="score">{{ caretaker.rating.toFixed(1) }} ★ · {{ caretaker.reviewCount }}条评价</text>
        <text class="muted">近30天完成：{{ caretaker.completedAdoptionsLast30Days }}</text>
        <text class="muted">好评率：{{ caretaker.positiveRate }}%</text>
      </view>

      <view class="button-row">
        <button data-test="responsible-fields" @click="showResponsibleFields">负责的田地</button>
        <button data-test="contact-caretaker" @click="contactCaretaker">联系管护员</button>
        <button data-test="close-modal" @click="close">关闭</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.36);
}

.modal-panel {
  width: 80%;
  max-width: 360px;
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
  box-sizing: border-box;
}

.photo-row {
  display: flex;
  gap: 12px;
}

.photo {
  width: 50%;
  height: 120px;
  border-radius: 10px;
  background: #eef6ea;
  object-fit: cover;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 14px;
}

.name {
  color: #2d3a2d;
  font-size: 14px;
  font-weight: 700;
}

.score {
  color: #4caf50;
  font-size: 14px;
  font-weight: 700;
}

.muted {
  color: #6b766b;
  font-size: 12px;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.button-row button {
  flex: 1;
  min-width: 88px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 12px;
}
</style>
```

- [ ] **Step 4: Run modal tests**

Run:

```bash
npm test -- tests/components/CaretakerDetailModal.test.ts
```

Expected: PASS, 4 tests pass.

- [ ] **Step 5: Commit caretaker modal**

Run:

```bash
git add src/components/CaretakerDetailModal.vue tests/components/CaretakerDetailModal.test.ts
git commit -m "feat: add caretaker detail modal"
```

Expected: commit succeeds.

---

### Task 7: Build garden list page

**Files:**
- Create: `src/pages/garden/index.vue`
- Test: `tests/pages/garden.test.ts`

- [ ] **Step 1: Write failing garden page tests**

Create `tests/pages/garden.test.ts`:

```ts
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GardenPage from '../../src/pages/garden/index.vue'
import { clearAnalyticsEvents, getAnalyticsEvents } from '../../src/services/analytics'


describe('GardenPage', () => {
  beforeEach(() => {
    clearAnalyticsEvents()
    vi.mocked(uni.navigateTo).mockClear()
    vi.mocked(uni.showToast).mockClear()
  })

  it('loads fields and tracks page view', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    expect(wrapper.text()).toContain('我的田园')
    expect(wrapper.text()).toContain('田地001')
    expect(wrapper.text()).toContain('我的小菜园')
    expect(getAnalyticsEvents()[0]).toMatchObject({ event: 'page_view', pageName: 'garden' })
  })

  it('filters by keyword', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.get('[data-test="search-input"]').setValue('小菜园')
    await wrapper.get('[data-test="search-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('我的小菜园')
    expect(wrapper.text()).not.toContain('田地001')
  })

  it('shows map view unavailable message', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.get('[data-test="map-tab"]').trigger('click')

    expect(wrapper.text()).toContain('地图视图即将开放')
  })

  it('navigates to caretaker selection from idle field', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('[data-test="field-action"]')[0].trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/caretaker-select/index?field_id=field-001' })
  })

  it('opens caretaker modal and tracks click/detail view', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('[data-test="caretaker-avatar"]')[0].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('18年管护经验')
    expect(getAnalyticsEvents().map((event) => event.event)).toContain('caretaker_click')
    expect(getAnalyticsEvents().map((event) => event.event)).toContain('caretaker_detail_view')
  })
})
```

- [ ] **Step 2: Run garden page tests to verify they fail**

Run:

```bash
npm test -- tests/pages/garden.test.ts
```

Expected: FAIL because `src/pages/garden/index.vue` does not exist.

- [ ] **Step 3: Create garden page**

Create `src/pages/garden/index.vue`:

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FieldCard from '../../components/FieldCard.vue'
import CaretakerDetailModal from '../../components/CaretakerDetailModal.vue'
import { getCaretakerById, getFields } from '../../services/gardenApi'
import { trackEvent } from '../../services/analytics'
import type { Caretaker, CaretakerSummary, Field, FieldFilters, FieldStatus } from '../../types/garden'

const fields = ref<Field[]>([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const selectedStatus = ref<FieldStatus | ''>('')
const activeView = ref<'list' | 'map'>('list')
const selectedCaretaker = ref<Caretaker | null>(null)
const modalOpen = ref(false)

async function loadFields() {
  loading.value = true
  error.value = ''

  try {
    const filters: FieldFilters = {}
    if (keyword.value) filters.keyword = keyword.value
    if (selectedStatus.value) filters.status = selectedStatus.value
    const result = await getFields(filters)
    fields.value = result.items
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : '田地列表加载失败'
  } finally {
    loading.value = false
  }
}

function selectView(view: 'list' | 'map') {
  activeView.value = view
}

function adoptField(field: Field) {
  uni.navigateTo({ url: `/pages/caretaker-select/index?field_id=${field.id}` })
}

function showFieldDetails(field: Field) {
  uni.showToast({ title: `${field.name}详情即将开放`, icon: 'none' })
}

async function openCaretaker(caretakerSummary: CaretakerSummary | undefined) {
  if (!caretakerSummary) return
  trackEvent({ event: 'caretaker_click', userId: 'user-demo', caretakerId: caretakerSummary.id })
  selectedCaretaker.value = await getCaretakerById(caretakerSummary.id)
  modalOpen.value = true
  trackEvent({ event: 'caretaker_detail_view', userId: 'user-demo', caretakerId: caretakerSummary.id })
}

function closeCaretaker() {
  modalOpen.value = false
}

function filterResponsibleFields(caretaker: Caretaker) {
  keyword.value = caretaker.name
  modalOpen.value = false
  void loadFields()
}

function contactCaretaker() {
  uni.showToast({ title: '功能暂未开放', icon: 'none' })
}

onMounted(() => {
  trackEvent({ event: 'page_view', userId: 'user-demo', pageName: 'garden' })
  void loadFields()
})
</script>

<template>
  <view class="page">
    <view class="nav">
      <text class="back">←</text>
      <text class="title">我的田园</text>
      <text class="nav-action">筛选</text>
    </view>

    <view class="search-row">
      <input v-model="keyword" data-test="search-input" class="search-input" placeholder="搜索田地、作物、管护员" />
      <button data-test="search-button" class="search-button" @click="loadFields">搜索</button>
    </view>

    <view class="filter-row">
      <button :class="{ active: selectedStatus === '' }" @click="selectedStatus = ''; loadFields()">全部</button>
      <button :class="{ active: selectedStatus === 'idle' }" @click="selectedStatus = 'idle'; loadFields()">空闲</button>
      <button :class="{ active: selectedStatus === 'adopted' }" @click="selectedStatus = 'adopted'; loadFields()">已认养</button>
      <button :class="{ active: selectedStatus === 'ready_to_harvest' }" @click="selectedStatus = 'ready_to_harvest'; loadFields()">待收获</button>
    </view>

    <view class="tabs">
      <button data-test="list-tab" :class="{ active: activeView === 'list' }" @click="selectView('list')">列表视图</button>
      <button data-test="map-tab" :class="{ active: activeView === 'map' }" @click="selectView('map')">地图视图</button>
    </view>

    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="error" class="state">{{ error }}</view>
    <view v-else-if="activeView === 'map'" class="state">地图视图即将开放</view>
    <view v-else-if="fields.length === 0" class="state">暂无符合条件的田地</view>
    <view v-else>
      <FieldCard
        v-for="field in fields"
        :key="field.id"
        :field="field"
        @adopt="adoptField"
        @details="showFieldDetails"
        @caretaker="openCaretaker"
      />
    </view>

    <CaretakerDetailModal
      :open="modalOpen"
      :caretaker="selectedCaretaker"
      @close="closeCaretaker"
      @responsible-fields="filterResponsibleFields"
      @contact="contactCaretaker"
    />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f6fbf3;
  padding-bottom: 24px;
}

.nav,
.search-row,
.filter-row,
.tabs {
  display: flex;
  align-items: center;
  margin: 0 16px;
}

.nav {
  justify-content: space-between;
  padding: 14px 0;
}

.title {
  color: #2d3a2d;
  font-size: 18px;
  font-weight: 700;
}

.back,
.nav-action {
  color: #4caf50;
  font-size: 14px;
}

.search-row {
  gap: 8px;
}

.search-input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #dde8d8;
  border-radius: 999px;
  background: #ffffff;
  box-sizing: border-box;
}

.search-button,
.filter-row button,
.tabs button {
  border: 0;
  border-radius: 999px;
  background: #ffffff;
  color: #6b766b;
}

.search-button {
  width: 72px;
  height: 38px;
  background: #4caf50;
  color: #ffffff;
}

.filter-row,
.tabs {
  gap: 8px;
  margin-top: 12px;
}

.filter-row button,
.tabs button {
  height: 32px;
  padding: 0 12px;
}

.filter-row button.active,
.tabs button.active {
  background: #4caf50;
  color: #ffffff;
}

.state {
  margin: 40px 16px;
  color: #6b766b;
  text-align: center;
}
</style>
```

- [ ] **Step 4: Run garden page tests**

Run:

```bash
npm test -- tests/pages/garden.test.ts
```

Expected: PASS, 5 tests pass.

- [ ] **Step 5: Commit garden page**

Run:

```bash
git add src/pages/garden/index.vue tests/pages/garden.test.ts
git commit -m "feat: add garden list page"
```

Expected: commit succeeds.

---

### Task 8: Build caretaker selection page

**Files:**
- Create: `src/pages/caretaker-select/index.vue`
- Test: `tests/pages/caretakerSelect.test.ts`

- [ ] **Step 1: Write failing selection page tests**

Create `tests/pages/caretakerSelect.test.ts`:

```ts
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CaretakerSelectPage from '../../src/pages/caretaker-select/index.vue'
import { clearAnalyticsEvents, getAnalyticsEvents } from '../../src/services/analytics'


describe('CaretakerSelectPage', () => {
  beforeEach(() => {
    clearAnalyticsEvents()
    vi.mocked(uni.navigateTo).mockClear()
    vi.mocked(uni.showToast).mockClear()
  })

  it('loads recommended and all caretakers', async () => {
    const wrapper = mount(CaretakerSelectPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    expect(wrapper.text()).toContain('系统推荐（3公里内）')
    expect(wrapper.text()).toContain('全部管护员')
    expect(wrapper.text()).toContain('张叔')
    expect(wrapper.text()).toContain('李伯')
  })

  it('selects caretaker and tracks event', async () => {
    const wrapper = mount(CaretakerSelectPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    await wrapper.findAll('.caretaker-card')[0].trigger('click')

    expect(wrapper.text()).toContain('已选择：张叔')
    expect(getAnalyticsEvents()[0]).toMatchObject({ event: 'caretaker_select', caretakerId: 'caretaker-zhang', fieldId: 'field-001' })
  })

  it('keeps confirm disabled until caretaker is selected', async () => {
    const wrapper = mount(CaretakerSelectPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    expect(wrapper.get('[data-test="confirm-selection"]').attributes('disabled')).toBeDefined()
  })

  it('creates adoption and navigates to payment confirmation', async () => {
    const wrapper = mount(CaretakerSelectPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    await wrapper.findAll('.caretaker-card')[0].trigger('click')
    await wrapper.get('[data-test="confirm-selection"]').trigger('click')
    await flushPromises()

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/payment/confirm?adoption_id=adoption-field-001-caretaker-zhang' })
  })
})
```

- [ ] **Step 2: Run selection page tests to verify they fail**

Run:

```bash
npm test -- tests/pages/caretakerSelect.test.ts
```

Expected: FAIL because `src/pages/caretaker-select/index.vue` does not exist.

- [ ] **Step 3: Create caretaker selection page**

Create `src/pages/caretaker-select/index.vue`:

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CaretakerAvatarCard from '../../components/CaretakerAvatarCard.vue'
import CaretakerDetailModal from '../../components/CaretakerDetailModal.vue'
import { createAdoption, getCaretakers, getRecommendedCaretakers } from '../../services/gardenApi'
import { trackEvent } from '../../services/analytics'
import type { Caretaker } from '../../types/garden'

const props = withDefaults(defineProps<{
  fieldId?: string
}>(), {
  fieldId: 'field-001'
})

const recommendedCaretakers = ref<Caretaker[]>([])
const allCaretakers = ref<Caretaker[]>([])
const selectedCaretaker = ref<Caretaker | null>(null)
const detailCaretaker = ref<Caretaker | null>(null)
const modalOpen = ref(false)
const loading = ref(false)
const error = ref('')

async function loadCaretakers() {
  loading.value = true
  error.value = ''

  try {
    const [recommended, all] = await Promise.all([
      getRecommendedCaretakers(props.fieldId),
      getCaretakers()
    ])
    recommendedCaretakers.value = recommended.items
    allCaretakers.value = all.items
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : '管护员列表加载失败'
  } finally {
    loading.value = false
  }
}

function selectCaretaker(caretaker: Caretaker) {
  selectedCaretaker.value = caretaker
  trackEvent({ event: 'caretaker_select', userId: 'user-demo', fieldId: props.fieldId, caretakerId: caretaker.id })
}

function showDetail(caretaker: Caretaker) {
  detailCaretaker.value = caretaker
  modalOpen.value = true
  trackEvent({ event: 'caretaker_detail_view', userId: 'user-demo', caretakerId: caretaker.id })
}

function closeDetail() {
  modalOpen.value = false
}

function contactCaretaker() {
  uni.showToast({ title: '功能暂未开放', icon: 'none' })
}

async function confirmSelection() {
  if (!selectedCaretaker.value) return

  try {
    const result = await createAdoption({ fieldId: props.fieldId, caretakerId: selectedCaretaker.value.id })
    uni.navigateTo({ url: result.nextUrl })
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : '创建认养失败'
    uni.showToast({ title: message, icon: 'none' })
  }
}

onMounted(() => {
  void loadCaretakers()
})
</script>

<template>
  <view class="page">
    <view class="nav">
      <text class="back">←</text>
      <text class="title">选择管护员</text>
      <text class="spacer" />
    </view>

    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="error" class="state">{{ error }}</view>
    <view v-else class="content">
      <view class="section">
        <text class="section-title">系统推荐（3公里内）</text>
        <scroll-view scroll-x class="caretaker-scroll">
          <view class="caretaker-row">
            <CaretakerAvatarCard
              v-for="caretaker in recommendedCaretakers"
              :key="caretaker.id"
              class="caretaker-card"
              :caretaker="caretaker"
              :selected="selectedCaretaker?.id === caretaker.id"
              @select="selectCaretaker"
              @detail="showDetail"
            />
          </view>
        </scroll-view>
      </view>

      <view class="section">
        <text class="section-title">全部管护员</text>
        <scroll-view scroll-x class="caretaker-scroll">
          <view class="caretaker-row">
            <CaretakerAvatarCard
              v-for="caretaker in allCaretakers"
              :key="caretaker.id"
              class="caretaker-card"
              :caretaker="caretaker"
              :selected="selectedCaretaker?.id === caretaker.id"
              @select="selectCaretaker"
              @detail="showDetail"
            />
          </view>
        </scroll-view>
      </view>

      <view class="selected-summary">
        <text>{{ selectedCaretaker ? `已选择：${selectedCaretaker.name}` : '请选择一位管护员' }}</text>
      </view>
    </view>

    <view class="confirm-bar">
      <button data-test="confirm-selection" :disabled="!selectedCaretaker" @click="confirmSelection">确认选择</button>
    </view>

    <CaretakerDetailModal
      :open="modalOpen"
      :caretaker="detailCaretaker"
      @close="closeDetail"
      @responsible-fields="closeDetail"
      @contact="contactCaretaker"
    />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 82px;
  background: #f6fbf3;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.title {
  color: #2d3a2d;
  font-size: 18px;
  font-weight: 700;
}

.back,
.spacer {
  width: 40px;
  color: #4caf50;
}

.section {
  margin: 16px;
}

.section-title {
  display: block;
  margin-bottom: 12px;
  color: #2d3a2d;
  font-weight: 700;
}

.caretaker-scroll {
  white-space: nowrap;
}

.caretaker-row {
  display: flex;
}

.selected-summary,
.state {
  margin: 24px 16px;
  color: #6b766b;
  text-align: center;
}

.confirm-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 12px 16px;
  background: #ffffff;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
}

.confirm-bar button {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.confirm-bar button[disabled] {
  background: #b7c5b1;
}
</style>
```

- [ ] **Step 4: Run selection page tests**

Run:

```bash
npm test -- tests/pages/caretakerSelect.test.ts
```

Expected: PASS, 4 tests pass.

- [ ] **Step 5: Commit caretaker selection page**

Run:

```bash
git add src/pages/caretaker-select/index.vue tests/pages/caretakerSelect.test.ts
git commit -m "feat: add caretaker selection page"
```

Expected: commit succeeds.

---

### Task 9: Build payment confirmation page

**Files:**
- Create: `src/pages/payment/confirm.vue`

- [ ] **Step 1: Create payment confirmation page**

Create `src/pages/payment/confirm.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { getStoredAdoption } from '../../services/gardenApi'
import type { Adoption } from '../../types/garden'

const props = withDefaults(defineProps<{
  adoptionId?: string
}>(), {
  adoptionId: 'adoption-field-001-caretaker-zhang'
})

const adoption = ref<Adoption | undefined>(getStoredAdoption(props.adoptionId))
</script>

<template>
  <view class="page">
    <view class="card" v-if="adoption">
      <text class="title">认养待支付</text>
      <text>认养编号：{{ adoption.id }}</text>
      <text>田地编号：{{ adoption.fieldId }}</text>
      <text>管护员编号：{{ adoption.caretakerId }}</text>
      <text>支付单号：{{ adoption.paymentOrderId }}</text>
      <button>去支付</button>
    </view>
    <view class="card" v-else>
      <text class="title">未找到认养记录</text>
      <text>请返回田园重新选择田地和管护员。</text>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 16px;
  background: #f6fbf3;
  box-sizing: border-box;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 16px;
  background: #ffffff;
  color: #2d3a2d;
}

.title {
  font-size: 18px;
  font-weight: 700;
}

button {
  height: 44px;
  margin-top: 12px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}
</style>
```

- [ ] **Step 2: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS for all service, component, and page tests.

- [ ] **Step 3: Build H5 app**

Run:

```bash
npm run build:h5
```

Expected: command exits 0 and produces a H5 build output under the uni-app build directory.

- [ ] **Step 4: Commit payment confirmation page**

Run:

```bash
git add src/pages/payment/confirm.vue
git commit -m "feat: add adoption payment confirmation"
```

Expected: commit succeeds.

---

### Task 10: Manual UI verification

**Files:**
- Modify only if issues are found during verification.

- [ ] **Step 1: Start H5 dev server**

Run:

```bash
npm run dev:h5
```

Expected: dev server starts and prints a local URL.

- [ ] **Step 2: Verify garden page golden path**

Open the local URL printed by the dev server and navigate to the garden page if it is not already the default.

Verify:

- The page title is “我的田园”.
- The list view is selected by default.
- Field cards show 180px-style spacing, 80x80 caretaker avatars, status tags, crop progress, and action buttons.
- Clicking “地图视图” shows “地图视图即将开放”.
- Searching “小菜园” leaves “我的小菜园” visible and hides “田地001”.
- Clicking a caretaker avatar opens the detail modal.
- Clicking “联系管护员” shows “功能暂未开放”.

- [ ] **Step 3: Verify caretaker selection golden path**

From “田地001”, click “立即认养”.

Verify:

- The selection page shows “系统推荐（3公里内）” and “全部管护员”.
- Horizontal caretaker rows scroll without obvious stutter.
- Selecting “张叔” shows a green border and “已选择：张叔”.
- Confirm button is disabled before selection and enabled after selection.
- Clicking “确认选择” navigates to the payment confirmation page.

- [ ] **Step 4: Verify responsive behavior**

Use browser device emulation for a small iPhone-sized viewport and a larger Android-sized viewport.

Verify:

- Field cards do not overflow horizontally.
- Modal width is about 80% of the viewport.
- Bottom confirm bar does not cover selectable content in an unusable way.

- [ ] **Step 5: Stop dev server**

Stop the dev server with `Ctrl+C`.

Expected: process exits cleanly.

- [ ] **Step 6: Commit verification fixes if any files changed**

If verification required fixes, run:

```bash
git status --short
git add <changed-files>
git commit -m "fix: polish garden MVP UI"
```

Expected: commit succeeds if there were changes; skip this step if `git status --short` has no output.

---

## Self-Review

### Spec coverage

Covered by this plan:

- 田园主界面列表视图。
- 搜索与状态筛选。
- 田地卡片状态、作物、进度、预计收获时间。
- 管护员头像展示与点击详情。
- 选择管护员页面。
- 系统推荐和全部管护员横向展示。
- 单选高亮和确认选择。
- 创建 pending payment 认养并跳转支付确认。
- 地图视图入口显示未开放状态。
- 聊天入口显示未开放状态。
- 5 个埋点中的用户端相关事件：`page_view`、`caretaker_click`、`caretaker_detail_view`、`caretaker_select`。

Handled in separate plans:

- Real backend REST services and database persistence.
- Management admin image upload, WebP conversion, binding, and review workflows.
- Caretaker change request flow.
- Real payment provider integration.
- Real chat integration.
- Cross-platform packaging verification for WeChat Mini Program, Alipay Mini Program, and native App.

### Placeholder scan

The plan avoids unresolved requirement markers and defines concrete files, commands, and code for each implementation step.

### Type consistency

The plan defines domain types in `src/types/garden.ts` before they are used by mock data, services, components, and pages. Property names remain consistent across all planned files: `fieldId`, `caretakerId`, `avatarUrl`, `realPhotoUrl`, `experienceYears`, `positiveRate`, and `distanceKm`.
