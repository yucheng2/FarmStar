# 养护员小程序 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 FarmStar 创建独立的养护员小程序，养护员可登录并管理自己负责的田地、记录养护日志、查看认养用户。

**Architecture:** 独立 uniapp 项目，复用 FarmStar 现有类型定义和数据结构，视觉风格保持一致。养护员登录后只能看到自己负责的田地，通过 caretaker_id 过滤数据。

**Tech Stack:** uniapp + Vue 3 + TypeScript + Tailwind CSS（与 FarmStar 用户端一致）

---

## 文件结构

```
caretaker-app/                          # 新项目根目录
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── manifest.json
│   ├── pages.json                     # 养护员专属页面路由
│   ├── types/
│   │   └── garden.ts                  # 从 FarmStar 复制
│   ├── mocks/
│   │   └── gardenData.ts              # 从 FarmStar 复制
│   ├── services/
│   │   ├── authApi.ts                 # 养护员登录认证
│   │   └── caretakerApi.ts            # 养护员业务 API
│   ├── composables/
│   │   └── useCaretakerAuth.ts       # 养护员登录态管理
│   ├── components/
│   │   ├── TaskCard.vue              # 任务卡片
│   │   ├── FieldInfoCard.vue         # 田地信息卡片
│   │   ├── CareLogItem.vue           # 养护记录项
│   │   ├── BottomNav.vue             # 底部导航
│   │   └── EmptyState.vue            # 空状态组件
│   ├── pages/
│   │   ├── caretaker-login/
│   │   │   └── index.vue             # 登录页
│   │   ├── caretaker-home/
│   │   │   └── index.vue             # 首页/任务列表
│   │   ├── caretaker-map/
│   │   │   └── index.vue             # 田地地图
│   │   ├── caretaker-field/
│   │   │   └── index.vue             # 田地详情
│   │   ├── caretaker-care-log/
│   │   │   └── index.vue             # 养护记录
│   │   ├── caretaker-scan/
│   │   │   └── index.vue             # 扫码页
│   │   └── caretaker-profile/
│   │       └── index.vue             # 个人中心
│   └── styles/
│       └── index.css                 # 全局样式
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

---

## Task 1: 项目初始化

**Files:**
- Create: `caretaker-app/package.json`
- Create: `caretaker-app/vite.config.ts`
- Create: `caretaker-app/tsconfig.json`
- Create: `caretaker-app/tailwind.config.js`
- Create: `caretaker-app/index.html`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "farmstar-caretaker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vite test"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.3.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0",
    "jsdom": "^25.0.0",
    "@vue/test-utils": "^2.4.0"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false
  }
})
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        'primary-foreground': '#FFFFFF',
        background: '#F6FBF3',
        foreground: '#2D3A2D',
        card: '#FFFFFF',
        'card-foreground': '#2D3A2D',
        muted: '#6B766B',
        'muted-foreground': '#6B766B',
        border: '#DDE8D8'
      }
    }
  },
  plugins: []
}
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FarmStar 养护员</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add caretaker-app/package.json caretaker-app/vite.config.ts caretaker-app/tsconfig.json caretaker-app/tailwind.config.js caretaker-app/index.html
git commit -m "feat(caretaker): initialize caretaker app project structure"
```

---

## Task 2: 类型和数据复制

**Files:**
- Create: `caretaker-app/src/types/garden.ts`
- Create: `caretaker-app/src/mocks/gardenData.ts`
- Create: `caretaker-app/src/styles/index.css`
- Create: `caretaker-app/src/main.ts`
- Create: `caretaker-app/src/App.vue`

- [ ] **Step 1: Copy types/garden.ts from FarmStar**

从 `/Users/yuchengfan/dev/personal/FarmStar/src/types/garden.ts` 复制完整内容到 `caretaker-app/src/types/garden.ts`

- [ ] **Step 2: Copy mocks/gardenData.ts from FarmStar**

从 `/Users/yuchengfan/dev/personal/FarmStar/src/mocks/gardenData.ts` 复制完整内容到 `caretaker-app/src/mocks/gardenData.ts`

- [ ] **Step 3: Create styles/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #4CAF50;
  --color-primary-foreground: #FFFFFF;
  --color-background: #F6FBF3;
  --color-foreground: #2D3A2D;
  --color-card: #FFFFFF;
  --color-card-foreground: #2D3A2D;
  --color-muted: #6B766B;
  --color-muted-foreground: #6B766B;
  --color-border: #DDE8D8;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--color-background);
  color: var(--color-foreground);
  margin: 0;
  padding: 0;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:active {
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--color-card);
  color: var(--color-muted-foreground);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.card {
  background-color: var(--color-card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-field {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color-foreground);
  width: 100%;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-field::placeholder {
  color: var(--color-muted-foreground);
}
```

- [ ] **Step 4: Create main.ts**

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.css'

createApp(App).mount('#app')
```

- [ ] **Step 5: Create App.vue**

```vue
<script setup lang="ts">
// App root component
</script>

<template>
  <view class="min-h-dvh bg-background">
    <RouterView />
  </view>
</template>
```

- [ ] **Step 6: Commit**

```bash
git add caretaker-app/src/
git commit -m "feat(caretaker): add types, mocks, styles, and app entry"
```

---

## Task 3: 登录认证服务

**Files:**
- Create: `caretaker-app/src/services/authApi.ts`
- Create: `caretaker-app/src/composables/useCareTakerAuth.ts`
- Create: `caretaker-app/src/pages/caretaker-login/index.vue`
- Create: `tests/pages/caretaker-login.test.ts`

- [ ] **Step 1: Create authApi.ts**

```typescript
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
```

- [ ] **Step 2: Create useCareTakerAuth.ts**

```typescript
import { ref } from 'vue'
import { isLoggedIn, getCareTakerInfo, logout as authLogout, type CaretakerUser } from '../services/authApi'

const caretakerInfo = ref<CaretakerUser | null>(getCareTakerInfo())
const loggedIn = ref(isLoggedIn())

function updateAuth() {
  caretakerInfo.value = getCareTakerInfo()
  loggedIn.value = isLoggedIn()
}

function logout() {
  authLogout()
  updateAuth()
}

export function useCareTakerAuth() {
  return {
    caretakerInfo,
    loggedIn,
    logout,
    updateAuth
  }
}
```

- [ ] **Step 3: Create caretaker-login/index.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { caretakerLogin, sendVerifyCode } from '../../../services/authApi'
import { useCareTakerAuth } from '../../../composables/useCareTakerAuth'

const phone = ref('')
const code = ref('')
const loading = ref(false)
const error = ref('')
const countdown = ref(0)

const { updateAuth } = useCareTakerAuth()

async function handleSendCode() {
  if (countdown.value > 0) return
  try {
    await sendVerifyCode(phone.value)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '发送失败'
  }
}

async function handleLogin() {
  if (!phone.value || !code.value) {
    error.value = '请输入手机号和验证码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await caretakerLogin(phone.value, code.value)
    updateAuth()
    uni.reLaunch({ url: '/pages/caretaker-home/index' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
    <view class="w-full max-w-sm">
      <!-- Logo -->
      <view class="text-center mb-8">
        <view class="text-3xl font-bold text-primary mb-2">FarmStar</view>
        <view class="text-muted-foreground">养护员登录</view>
      </view>

      <!-- Form -->
      <view class="card space-y-4">
        <view>
          <input
            v-model="phone"
            class="input-field w-full"
            type="tel"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>
        <view class="flex gap-2">
          <input
            v-model="code"
            class="input-field flex-1"
            type="number"
            placeholder="验证码"
            maxlength="6"
          />
          <button
            class="btn-secondary px-4"
            :disabled="countdown > 0"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </button>
        </view>

        <view v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </view>

        <button
          class="btn-primary w-full h-12"
          :disabled="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>

      <!-- Demo hint -->
      <view class="text-center text-muted-foreground text-xs mt-4">
        测试验证码: 123456
      </view>
    </view>
  </view>
</template>
```

- [ ] **Step 4: Create tests/pages/caretaker-login.test.ts**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

// Mock uni API
vi.mock('../../../src/services/authApi', () => ({
  caretakerLogin: vi.fn(),
  sendVerifyCode: vi.fn()
}))

describe('caretaker-login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation error when phone is invalid', async () => {
    const { caretakerLogin } = await import('../../../src/services/authApi')
    ;(caretakerLogin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('手机号格式错误'))

    const phone = ref('123')
    const code = ref('123456')

    try {
      await caretakerLogin(phone.value, code.value)
    } catch (e) {
      expect((e as Error).message).toBe('手机号格式错误')
    }
  })

  it('shows validation error when code is wrong', async () => {
    const { caretakerLogin } = await import('../../../src/services/authApi')
    ;(caretakerLogin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('验证码错误'))

    const phone = ref('13812340001')
    const code = ref('000000')

    try {
      await caretakerLogin(phone.value, code.value)
    } catch (e) {
      expect((e as Error).message).toBe('验证码错误')
    }
  })

  it('login succeeds with correct credentials', async () => {
    const { caretakerLogin, setCareTakerToken, setCareTakerInfo } = await import('../../../src/services/authApi')
    const mockUser = { id: 'caretaker-zhang', name: '张叔', phone: '13812340001', avatarUrl: '', village: '青禾村' }
    ;(caretakerLogin as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)

    const phone = ref('13812340001')
    const code = ref('123456')

    const result = await caretakerLogin(phone.value, code.value)
    expect(result).toEqual(mockUser)
  })
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd caretaker-app && npm test`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add caretaker-app/src/services/authApi.ts caretaker-app/src/composables/useCareTakerAuth.ts caretaker-app/src/pages/caretaker-login/index.vue tests/pages/caretaker-login.test.ts
git commit -m "feat(caretaker): add login page and auth service"
```

---

## Task 4: 底部导航和页面框架

**Files:**
- Create: `caretaker-app/src/components/BottomNav.vue`
- Create: `caretaker-app/src/components/EmptyState.vue`
- Create: `caretaker-app/src/pages.json`

- [ ] **Step 1: Create BottomNav.vue**

```vue
<script setup lang="ts">
defineProps<{
  active: 'home' | 'map' | 'scan' | 'profile'
}>()

const emit = defineEmits<{
  navigate: [tab: 'home' | 'map' | 'scan' | 'profile']
}>()

const tabs = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'map', label: '地图', icon: '🗺️' },
  { key: 'scan', label: '扫码', icon: '📷' },
  { key: 'profile', label: '我的', icon: '👤' }
] as const
</script>

<template>
  <view class="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
    <view class="flex justify-around items-center h-16">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex flex-col items-center justify-center gap-1 p-2"
        :class="active === tab.key ? 'text-primary' : 'text-muted-foreground'"
        @click="emit('navigate', tab.key)"
      >
        <text class="text-xl">{{ tab.icon }}</text>
        <text class="text-xs">{{ tab.label }}</text>
      </button>
    </view>
  </view>
</template>
```

- [ ] **Step 2: Create EmptyState.vue**

```vue
<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  actionText?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <text class="text-4xl mb-4">📭</text>
    <view class="text-lg font-medium text-foreground mb-2">{{ title }}</view>
    <view v-if="description" class="text-sm text-muted-foreground mb-4">{{ description }}</view>
    <button v-if="actionText" class="btn-primary" @click="emit('action')">
      {{ actionText }}
    </button>
  </view>
</template>
```

- [ ] **Step 3: Create pages.json**

```json
{
  "pages": [
    {
      "path": "pages/caretaker-login/index",
      "style": { "navigationBarTitleText": "养护员登录" }
    },
    {
      "path": "pages/caretaker-home/index",
      "style": { "navigationBarTitleText": "我的任务" }
    },
    {
      "path": "pages/caretaker-map/index",
      "style": { "navigationBarTitleText": "田地地图" }
    },
    {
      "path": "pages/caretaker-field/index",
      "style": { "navigationBarTitleText": "田地详情" }
    },
    {
      "path": "pages/caretaker-care-log/index",
      "style": { "navigationBarTitleText": "养护记录" }
    },
    {
      "path": "pages/caretaker-scan/index",
      "style": { "navigationBarTitleText": "扫码" }
    },
    {
      "path": "pages/caretaker-profile/index",
      "style": { "navigationBarTitleText": "个人中心" }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "FarmStar养护员",
    "navigationBarBackgroundColor": "#F6FBF3",
    "backgroundColor": "#F6FBF3"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add caretaker-app/src/components/BottomNav.vue caretaker-app/src/components/EmptyState.vue caretaker-app/src/pages.json
git commit -m "feat(caretaker): add BottomNav, EmptyState, and pages.json"
```

---

## Task 5: 首页/任务列表页

**Files:**
- Create: `caretaker-app/src/pages/caretaker-home/index.vue`
- Create: `caretaker-app/src/components/TaskCard.vue`
- Create: `tests/pages/caretaker-home.test.ts`

- [ ] **Step 1: Create caretakerApi.ts (part 1 - getCaretakerTasks)**

```typescript
import type { Field, CareLog } from '../types/garden'
import { fields, careLogs, caretakers } from '../mocks/gardenData'

// Get caretaker's fields (mock: filter by caretakerId)
export async function getCaretakerFields(caretakerId: string): Promise<Field[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return fields.filter(f => f.caretaker?.id === caretakerId)
}

// Get today's tasks for caretaker
export interface TaskItem {
  field: Field
  urgency: 'high' | 'medium' | 'low'
  lastCareAt?: string
  adoptionCount: number
}

export async function getCaretakerTasks(caretakerId: string): Promise<TaskItem[]> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const caretakerFields = fields.filter(f => f.caretaker?.id === caretakerId)

  return caretakerFields.map(field => {
    const logs = careLogs[field.id] || []
    const lastLog = logs[0]
    const daysSinceLastCare = lastLog
      ? Math.floor((Date.now() - new Date(lastLog.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    let urgency: 'high' | 'medium' | 'low' = 'low'
    if (daysSinceLastCare > 3) urgency = 'high'
    else if (daysSinceLastCare > 1) urgency = 'medium'

    return {
      field,
      urgency,
      lastCareAt: lastLog?.createdAt,
      adoptionCount: field.adoptionId ? 1 : 0
    }
  }).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.urgency] - order[b.urgency]
  })
}
```

- [ ] **Step 2: Create TaskCard.vue**

```vue
<script setup lang="ts">
import type { TaskItem } from '../../services/caretakerApi'

defineProps<{
  task: TaskItem
}>()

const emit = defineEmits<{
  tap: [task: TaskItem]
}>()

function formatDate(dateStr?: string): string {
  if (!dateStr) return '从未'
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  return `${diffDays}天前`
}
</script>

<template>
  <view
    class="card mb-3"
    :class="task.urgency === 'high' ? 'border-l-4 border-red-500' : task.urgency === 'medium' ? 'border-l-4 border-yellow-500' : ''"
    @click="emit('tap', task)"
  >
    <view class="flex gap-3">
      <image
        v-if="task.field.imageUrl"
        :src="task.field.imageUrl"
        class="w-20 h-20 rounded-lg object-cover"
        :alt="task.field.name"
      />
      <view v-else class="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
        <text class="text-3xl">🌱</text>
      </view>

      <view class="flex-1">
        <view class="flex items-center justify-between">
          <text class="font-bold text-foreground">{{ task.field.name }}</text>
          <view
            v-if="task.urgency === 'high'"
            class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs"
          >
            紧急
          </view>
          <view
            v-else-if="task.urgency === 'medium'"
            class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-600 text-xs"
          >
            提醒
          </view>
        </view>

        <view class="text-sm text-muted-foreground mt-1">
          {{ task.field.code }} · {{ task.field.areaSquareMeters }}㎡
        </view>

        <view v-if="task.field.crop" class="text-sm text-primary mt-1">
          {{ task.field.crop.name }} · {{ task.field.crop.progressPercent }}%
        </view>

        <view class="flex items-center justify-between mt-2">
          <view class="text-xs text-muted-foreground">
            最后养护: {{ formatDate(task.lastCareAt) }}
          </view>
          <view v-if="task.adoptionCount > 0" class="text-xs text-muted-foreground">
            {{ task.adoptionCount }}人认养
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
```

- [ ] **Step 3: Create caretaker-home/index.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import TaskCard from '../../components/TaskCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import { getCareTakerInfo } from '../../services/authApi'
import { getCaretakerTasks, type TaskItem } from '../../services/caretakerApi'

const caretaker = getCareTakerInfo()
const tasks = ref<TaskItem[]>([])
const loading = ref(false)
const filter = ref<'all' | 'pending' | 'done'>('all')
const activeTab = ref<'home' | 'map' | 'scan' | 'profile'>('home')

onMounted(() => {
  void loadTasks()
})

async function loadTasks() {
  if (!caretaker) return
  loading.value = true
  try {
    tasks.value = await getCaretakerTasks(caretaker.id)
  } finally {
    loading.value = false
  }
}

function handleTaskTap(task: TaskItem) {
  uni.navigateTo({ url: `/pages/caretaker-field/index?field_id=${task.field.id}` })
}

function handleNav(tab: 'home' | 'map' | 'scan' | 'profile') {
  activeTab.value = tab
  if (tab === 'map') {
    uni.switchTab({ url: '/pages/caretaker-map/index' })
  } else if (tab === 'scan') {
    uni.navigateTo({ url: '/pages/caretaker-scan/index' })
  } else if (tab === 'profile') {
    uni.switchTab({ url: '/pages/caretaker-profile/index' })
  }
}

const filteredTasks = () => {
  if (filter.value === 'all') return tasks.value
  if (filter.value === 'pending') return tasks.value.filter(t => t.urgency !== 'low')
  return tasks.value.filter(t => t.urgency === 'low')
}
</script>

<template>
  <view class="min-h-dvh bg-background pb-20">
    <!-- Header -->
    <view class="bg-primary text-primary-foreground px-4 py-6">
      <view class="flex items-center gap-3">
        <image
          v-if="caretaker?.avatarUrl"
          :src="caretaker.avatarUrl"
          class="w-12 h-12 rounded-full"
          :alt="caretaker.name"
        />
        <view>
          <view class="text-lg font-bold">{{ caretaker?.name }}</view>
          <view class="text-sm opacity-80">{{ caretaker?.village }}</view>
        </view>
      </view>
      <view class="mt-4 flex items-center gap-4">
        <view class="text-center">
          <view class="text-2xl font-bold">{{ tasks.length }}</view>
          <view class="text-xs opacity-80">负责田地</view>
        </view>
        <view class="text-center">
          <view class="text-2xl font-bold">{{ tasks.filter(t => t.urgency === 'high').length }}</view>
          <view class="text-xs opacity-80">紧急</view>
        </view>
        <view class="text-center">
          <view class="text-2xl font-bold">{{ tasks.filter(t => t.urgency === 'medium').length }}</view>
          <view class="text-xs opacity-80">待处理</view>
        </view>
      </view>
    </view>

    <!-- Filter -->
    <view class="px-4 py-3 flex gap-2">
      <button
        :class="filter === 'all' ? 'btn-primary' : 'btn-secondary'"
        class="px-4 py-2 text-sm"
        @click="filter = 'all'"
      >
        全部
      </button>
      <button
        :class="filter === 'pending' ? 'btn-primary' : 'btn-secondary'"
        class="px-4 py-2 text-sm"
        @click="filter = 'pending'"
      >
        待处理
      </button>
      <button
        :class="filter === 'done' ? 'btn-primary' : 'btn-secondary'"
        class="px-4 py-2 text-sm"
        @click="filter = 'done'"
      >
        已完成
      </button>
    </view>

    <!-- Task List -->
    <view class="px-4">
      <view v-if="loading" class="text-center py-8 text-muted-foreground">
        加载中...
      </view>
      <EmptyState
        v-else-if="filteredTasks().length === 0"
        title="暂无任务"
        description="今天没有需要养护的田地"
      />
      <TaskCard
        v-else
        v-for="task in filteredTasks()"
        :key="task.field.id"
        :task="task"
        @tap="handleTaskTap"
      />
    </view>

    <BottomNav :active="activeTab" @navigate="handleNav" />
  </view>
</template>
```

- [ ] **Step 4: Create tests/pages/caretaker-home.test.ts**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// Mock caretakerApi
vi.mock('../../../src/services/caretakerApi', () => ({
  getCaretakerTasks: vi.fn()
}))

describe('caretaker-home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters tasks by urgency', async () => {
    const { getCaretakerTasks } = await import('../../../src/services/caretakerApi')
    const mockTasks = [
      { field: { id: '1', name: 'Field 1' }, urgency: 'high' as const, adoptionCount: 0 },
      { field: { id: '2', name: 'Field 2' }, urgency: 'low' as const, adoptionCount: 0 }
    ]
    ;(getCaretakerTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks)

    const filter = ref<'all' | 'pending' | 'done'>('all')
    const tasks = await getCaretakerTasks('caretaker-zhang')

    const filtered = filter.value === 'pending'
      ? tasks.filter(t => t.urgency !== 'low')
      : tasks

    expect(filtered.length).toBe(1)
    expect(filtered[0].urgency).toBe('high')
  })
})
```

- [ ] **Step 5: Run tests**

Run: `cd caretaker-app && npm test`

- [ ] **Step 6: Commit**

```bash
git add caretaker-app/src/services/caretakerApi.ts caretaker-app/src/pages/caretaker-home/index.vue caretaker-app/src/components/TaskCard.vue tests/pages/caretaker-home.test.ts
git commit -m "feat(caretaker): add home page with task list"
```

---

## Task 6: 田地详情页

**Files:**
- Create: `caretaker-app/src/components/FieldInfoCard.vue`
- Create: `caretaker-app/src/components/CareLogItem.vue`
- Create: `caretaker-app/src/pages/caretaker-field/index.vue`

- [ ] **Step 1: Create FieldInfoCard.vue**

```vue
<script setup lang="ts">
import type { Field } from '../../types/garden'

defineProps<{
  field: Field
}>()
</script>

<template>
  <view class="card">
    <view class="flex gap-3">
      <image
        v-if="field.imageUrl"
        :src="field.imageUrl"
        class="w-24 h-24 rounded-lg object-cover"
        :alt="field.name"
      />
      <view v-else class="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center">
        <text class="text-4xl">🌱</text>
      </view>

      <view class="flex-1">
        <view class="font-bold text-foreground">{{ field.name }}</view>
        <view class="text-sm text-muted-foreground mt-1">
          {{ field.code }} · {{ field.areaSquareMeters }}㎡
        </view>
        <view class="mt-2">
          <view
            class="inline-block px-2 py-0.5 rounded-full text-xs"
            :class="{
              'bg-green-100 text-green-700': field.status === 'idle',
              'bg-blue-100 text-blue-700': field.status === 'adopted',
              'bg-yellow-100 text-yellow-700': field.status === 'ready_to_harvest',
              'bg-orange-100 text-orange-700': field.status === 'maintenance'
            }"
          >
            {{ field.status === 'idle' ? '空闲' : field.status === 'adopted' ? '已认养' : field.status === 'ready_to_harvest' ? '待收获' : '养护中' }}
          </view>
        </view>
        <view v-if="field.crop" class="mt-2">
          <view class="text-sm text-primary">{{ field.crop.name }}</view>
          <view class="flex items-center gap-2 mt-1">
            <view class="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <view
                class="h-full bg-primary rounded-full"
                :style="{ width: `${field.crop.progressPercent}%` }"
              />
            </view>
            <text class="text-xs text-muted-foreground">{{ field.crop.progressPercent }}%</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
```

- [ ] **Step 2: Create CareLogItem.vue**

```vue
<script setup lang="ts">
import type { CareLog } from '../../types/garden'

defineProps<{
  log: CareLog
}>()

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}
</script>

<template>
  <view class="flex gap-3 py-3 border-b border-border last:border-b-0">
    <view class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <text class="text-sm">🌿</text>
    </view>
    <view class="flex-1">
      <view class="flex items-center justify-between">
        <view class="font-medium text-foreground">{{ log.action }}</view>
        <view class="text-xs text-muted-foreground">{{ formatDateTime(log.createdAt) }}</view>
      </view>
      <view v-if="log.note" class="text-sm text-muted-foreground mt-1">{{ log.note }}</view>
      <view class="text-xs text-muted-foreground mt-1">by {{ log.caretakerName }}</view>
    </view>
  </view>
</template>
```

- [ ] **Step 3: Update caretakerApi.ts - add getFieldDetail**

```typescript
// Add to caretakerApi.ts

export async function getFieldDetail(fieldId: string) {
  await new Promise(resolve => setTimeout(resolve, 300))
  const field = fields.find(f => f.id === fieldId)
  if (!field) throw new Error('田地不存在')
  const logs = careLogs[fieldId] || []
  return { field, logs }
}
```

- [ ] **Step 4: Create caretaker-field/index.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FieldInfoCard from '../../components/FieldInfoCard.vue'
import CareLogItem from '../../components/CareLogItem.vue'
import type { Field, CareLog } from '../../types/garden'

const fieldId = ref('')
const field = ref<Field | null>(null)
const logs = ref<CareLog[]>([])
const loading = ref(false)

onMounted(() => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  const options = (current as any)?.options || {}
  fieldId.value = options.field_id || ''
  if (fieldId.value) {
    void loadField()
  }
})

async function loadField() {
  loading.value = true
  try {
    const { getFieldDetail } = await import('../../services/caretakerApi')
    const result = await getFieldDetail(fieldId.value)
    field.value = result.field
    logs.value = result.logs
  } finally {
    loading.value = false
  }
}

function goToCareLog() {
  uni.navigateTo({ url: `/pages/caretaker-care-log/index?field_id=${fieldId.value}` })
}

function goToMonitoring() {
  uni.navigateTo({ url: `/pages/field-monitoring/index?field_id=${fieldId.value}` })
}
</script>

<template>
  <view class="min-h-dvh bg-background pb-6">
    <view v-if="loading" class="text-center py-8 text-muted-foreground">加载中...</view>

    <template v-else-if="field">
      <FieldInfoCard :field="field" class="m-4" />

      <!-- Actions -->
      <view class="px-4 flex gap-2">
        <button class="btn-primary flex-1" @click="goToCareLog">
          开始养护
        </button>
        <button class="btn-secondary flex-1" @click="goToMonitoring">
          查看监控
        </button>
      </view>

      <!-- Care Logs -->
      <view class="m-4">
        <view class="font-bold text-foreground mb-3">养护记录</view>
        <view class="card">
          <view v-if="logs.length === 0" class="text-center py-4 text-muted-foreground">
            暂无养护记录
          </view>
          <CareLogItem v-for="log in logs" :key="log.id" :log="log" />
        </view>
      </view>
    </template>
  </view>
</template>
```

- [ ] **Step 5: Commit**

```bash
git add caretaker-app/src/components/FieldInfoCard.vue caretaker-app/src/components/CareLogItem.vue caretaker-app/src/pages/caretaker-field/index.vue
git commit -m "feat(caretaker): add field detail page"
```

---

## Task 7: 养护记录页

**Files:**
- Create: `caretaker-app/src/pages/caretaker-care-log/index.vue`
- Create: `caretaker-app/src/services/caretakerApi.ts` (add createCareLog)

- [ ] **Step 1: Update caretakerApi.ts - add createCareLog**

```typescript
// Add to caretakerApi.ts

export async function createCareLog(
  fieldId: string,
  caretakerId: string,
  action: string,
  note?: string
): Promise<CareLog> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const caretaker = caretakers.find(c => c.id === caretakerId)
  if (!caretaker) throw new Error('养护员不存在')

  const newLog: CareLog = {
    id: `care-log-${Date.now()}`,
    action,
    note: note || '',
    createdAt: new Date().toISOString(),
    caretakerName: caretaker.name
  }

  // In real app, this would POST to server
  // For mock, just return the log
  return newLog
}
```

- [ ] **Step 2: Create caretaker-care-log/index.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CareLogItem from '../../components/CareLogItem.vue'
import EmptyState from '../../components/EmptyState.vue'
import type { Field, CareLog } from '../../types/garden'
import { getCareTakerInfo } from '../../services/authApi'
import { getFieldDetail, createCareLog } from '../../services/caretakerApi'

const fieldId = ref('')
const field = ref<Field | null>(null)
const logs = ref<CareLog[]>([])
const loading = ref(false)
const submitting = ref(false)

const actionTypes = [
  { key: '浇水', icon: '💧', label: '浇水' },
  { key: '除草', icon: '🌿', label: '除草' },
  { key: '施肥', icon: '🌱', label: '施肥' },
  { key: '巡检', icon: '👁️', label: '巡检' },
  { key: '收获', icon: '🌾', label: '收获' },
  { key: '其他', icon: '📝', label: '其他' }
]

const selectedAction = ref('')
const note = ref('')

onMounted(() => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  const options = (current as any)?.options || {}
  fieldId.value = options.field_id || ''
  if (fieldId.value) {
    void loadField()
  }
})

async function loadField() {
  loading.value = true
  try {
    const result = await getFieldDetail(fieldId.value)
    field.value = result.field
    logs.value = result.logs
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!selectedAction.value) {
    uni.showToast({ title: '请选择养护动作', icon: 'none' })
    return
  }

  const caretaker = getCareTakerInfo()
  if (!caretaker) {
    uni.showToast({ title: '未登录', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const newLog = await createCareLog(fieldId.value, caretaker.id, selectedAction.value, note.value)
    logs.value = [newLog, ...logs.value]
    selectedAction.value = ''
    note.value = ''
    uni.showToast({ title: '记录成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="min-h-dvh bg-background pb-6">
    <view v-if="loading" class="text-center py-8 text-muted-foreground">加载中...</view>

    <template v-else-if="field">
      <!-- Field Info -->
      <view class="bg-primary/10 p-4">
        <view class="font-bold text-foreground">{{ field.name }}</view>
        <view class="text-sm text-muted-foreground">{{ field.code }} · {{ field.areaSquareMeters }}㎡</view>
      </view>

      <!-- Action Selection -->
      <view class="p-4">
        <view class="font-bold text-foreground mb-3">选择养护动作</view>
        <view class="grid grid-cols-3 gap-3">
          <button
            v-for="action in actionTypes"
            :key="action.key"
            class="card flex flex-col items-center py-4 gap-2"
            :class="selectedAction === action.key ? 'border-2 border-primary bg-primary/5' : ''"
            @click="selectedAction = action.key"
          >
            <text class="text-2xl">{{ action.icon }}</text>
            <text class="text-sm" :class="selectedAction === action.key ? 'text-primary font-bold' : 'text-foreground'">
              {{ action.label }}
            </text>
          </button>
        </view>
      </view>

      <!-- Note -->
      <view class="px-4">
        <view class="font-bold text-foreground mb-3">备注（可选）</view>
        <textarea
          v-model="note"
          class="input-field w-full h-24 p-3"
          placeholder="添加备注..."
          maxlength="200"
        />
      </view>

      <!-- Submit -->
      <view class="px-4 mt-4">
        <button
          class="btn-primary w-full h-12"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? '提交中...' : '提交记录' }}
        </button>
      </view>

      <!-- Recent Logs -->
      <view class="p-4">
        <view class="font-bold text-foreground mb-3">最近记录</view>
        <view class="card">
          <EmptyState
            v-if="logs.length === 0"
            title="暂无记录"
            description="开始你的第一次养护记录吧"
          />
          <CareLogItem v-for="log in logs.slice(0, 5)" :key="log.id" :log="log" />
        </view>
      </view>
    </template>
  </view>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add caretaker-app/src/pages/caretaker-care-log/index.vue
git commit -m "feat(caretaker): add care log page with create functionality"
```

---

## Task 8: 扫码页

**Files:**
- Create: `caretaker-app/src/pages/caretaker-scan/index.vue`

- [ ] **Step 1: Create caretaker-scan/index.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'

const scanning = ref(false)
const error = ref('')

// In a real uniapp app, this would use uni.scanCode
async function handleScan() {
  scanning.value = true
  error.value = ''

  try {
    // Mock scan result - in real app, use uni.scanCode API
    // const result = await uni.scanCode({ onlyFromCamera: true })
    // For demo, simulate scanning field-002
    const mockResult = {
      errMsg: 'scanCode:ok',
      result: 'field-002'
    }

    if (mockResult.result) {
      // Parse field code from result
      const fieldCode = mockResult.result
      if (fieldCode.startsWith('field-')) {
        uni.navigateTo({ url: `/pages/caretaker-care-log/index?field_id=${fieldCode}` })
      } else {
        error.value = '无效的田地二维码'
      }
    }
  } catch (e) {
    error.value = '扫码失败，请重试'
  } finally {
    scanning.value = false
  }
}
</script>

<template>
  <view class="min-h-dvh bg-background flex flex-col">
    <!-- Scanner Area -->
    <view class="flex-1 flex flex-col items-center justify-center p-6">
      <view class="relative">
        <!-- Scanner Frame -->
        <view class="w-64 h-64 border-4 border-primary rounded-2xl relative overflow-hidden">
          <view class="absolute inset-0 bg-black/20" />
          <!-- Corner markers -->
          <view class="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl" />
          <view class="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl" />
          <view class="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl" />
          <view class="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl" />
          <!-- Scan line -->
          <view class="absolute left-2 right-2 h-0.5 bg-primary animate-pulse top-1/2" />
        </view>
      </view>

      <view class="text-center mt-8">
        <view class="text-lg font-bold text-foreground">扫描田地二维码</view>
        <view class="text-sm text-muted-foreground mt-2">将田地二维码放入框内即可自动扫描</view>
      </view>

      <view v-if="error" class="mt-4 text-red-500 text-sm">
        {{ error }}
      </view>
    </view>

    <!-- Scan Button -->
    <view class="p-6">
      <button
        class="btn-primary w-full h-14 text-lg"
        :disabled="scanning"
        @click="handleScan"
      >
        {{ scanning ? '扫描中...' : '开始扫码' }}
      </button>
    </view>

    <!-- Demo hint -->
    <view class="text-center text-muted-foreground text-xs pb-6">
      测试：点击按钮模拟扫描 field-002
    </view>
  </view>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add caretaker-app/src/pages/caretaker-scan/index.vue
git commit -m "feat(caretaker): add scan page"
```

---

## Task 9: 田地地图页

**Files:**
- Create: `caretaker-app/src/pages/caretaker-map/index.vue`

- [ ] **Step 1: Create caretaker-map/index.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import FieldInfoCard from '../../components/FieldInfoCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import { getCareTakerInfo } from '../../services/authApi'
import { getCaretakerFields } from '../../services/caretakerApi'
import type { Field } from '../../types/garden'

const caretaker = getCareTakerInfo()
const fields = ref<Field[]>([])
const loading = ref(false)
const selectedField = ref<Field | null>(null)
const activeTab = ref<'home' | 'map' | 'scan' | 'profile'>('map')

onMounted(() => {
  void loadFields()
})

async function loadFields() {
  if (!caretaker) return
  loading.value = true
  try {
    fields.value = await getCaretakerFields(caretaker.id)
  } finally {
    loading.value = false
  }
}

function handleMarkerTap(field: Field) {
  selectedField.value = field
}

function handleCloseDetail() {
  selectedField.value = null
}

function goToCareLog(field: Field) {
  uni.navigateTo({ url: `/pages/caretaker-care-log/index?field_id=${field.id}` })
}

function handleNav(tab: 'home' | 'map' | 'scan' | 'profile') {
  activeTab.value = tab
  if (tab === 'home') {
    uni.switchTab({ url: '/pages/caretaker-home/index' })
  } else if (tab === 'scan') {
    uni.navigateTo({ url: '/pages/caretaker-scan/index' })
  } else if (tab === 'profile') {
    uni.switchTab({ url: '/pages/caretaker-profile/index' })
  }
}

// Simple mock map - in real app would use Leaflet or uniapp map
const fieldPositions = [
  { id: 'field-001', x: 20, y: 30 },
  { id: 'field-002', x: 50, y: 40 },
  { id: 'field-008', x: 70, y: 60 }
]
</script>

<template>
  <view class="min-h-dvh bg-background pb-20">
    <!-- Map Area (simplified mock) -->
    <view class="relative h-dvh">
      <!-- Mock Map Background -->
      <view class="absolute inset-0 bg-gradient-to-b from-green-100 to-green-200">
        <view class="absolute inset-0 opacity-20">
          <!-- Grid lines -->
          <view v-for="i in 5" :key="'h'+i" class="absolute w-full h-px bg-green-800" :style="{ top: `${i * 20}%` }" />
          <view v-for="i in 5" :key="'v'+i" class="absolute h-full w-px bg-green-800" :style="{ left: `${i * 20}%` }" />
        </view>

        <!-- Field Markers -->
        <view
          v-for="pos in fieldPositions"
          :key="pos.id"
          class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          :style="{ left: `${pos.x}%`, top: `${pos.y}%` }"
          @click="handleMarkerTap(fields.find(f => f.id === pos.id)!)"
        >
          <view class="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <text class="text-xl">🌱</text>
          </view>
          <view class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-xs px-2 py-1 rounded">
            {{ fields.find(f => f.id === pos.id)?.name || pos.id }}
          </view>
        </view>
      </view>

      <!-- Field Detail Card -->
      <view
        v-if="selectedField"
        class="absolute bottom-24 left-4 right-4 card"
      >
        <view class="flex justify-between items-start mb-3">
          <view class="font-bold text-foreground">{{ selectedField.name }}</view>
          <button class="text-muted-foreground text-xl" @click="handleCloseDetail">×</button>
        </view>
        <FieldInfoCard :field="selectedField" class="mb-3" />
        <button class="btn-primary w-full" @click="goToCareLog(selectedField)">
          开始养护
        </button>
      </view>
    </view>

    <BottomNav :active="activeTab" @navigate="handleNav" />
  </view>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add caretaker-app/src/pages/caretaker-map/index.vue
git commit -m "feat(caretaker): add map page with field markers"
```

---

## Task 10: 个人中心页

**Files:**
- Create: `caretaker-app/src/pages/caretaker-profile/index.vue`

- [ ] **Step 1: Create caretaker-profile/index.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import { getCareTakerInfo, logout } from '../../services/authApi'
import { getCaretakerFields, getCaretakerTasks } from '../../services/caretakerApi'

const caretaker = getCareTakerInfo()
const fieldCount = ref(0)
const taskCount = ref(0)
const loading = ref(false)
const activeTab = ref<'home' | 'map' | 'scan' | 'profile'>('profile')

onMounted(() => {
  void loadStats()
})

async function loadStats() {
  if (!caretaker) return
  loading.value = true
  try {
    const fields = await getCaretakerFields(caretaker.id)
    const tasks = await getCaretakerTasks(caretaker.id)
    fieldCount.value = fields.length
    taskCount.value = tasks.filter(t => t.urgency !== 'low').length
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
        uni.reLaunch({ url: '/pages/caretaker-login/index' })
      }
    }
  })
}

function handleNav(tab: 'home' | 'map' | 'scan' | 'profile') {
  activeTab.value = tab
  if (tab === 'home') {
    uni.switchTab({ url: '/pages/caretaker-home/index' })
  } else if (tab === 'map') {
    uni.switchTab({ url: '/pages/caretaker-map/index' })
  } else if (tab === 'scan') {
    uni.navigateTo({ url: '/pages/caretaker-scan/index' })
  }
}
</script>

<template>
  <view class="min-h-dvh bg-background pb-20">
    <!-- Profile Header -->
    <view class="bg-primary text-primary-foreground p-6">
      <view class="flex items-center gap-4">
        <image
          v-if="caretaker?.avatarUrl"
          :src="caretaker.avatarUrl"
          class="w-20 h-20 rounded-full border-4 border-white/30"
          :alt="caretaker.name"
        />
        <view>
          <view class="text-2xl font-bold">{{ caretaker?.name }}</view>
          <view class="text-sm opacity-80">{{ caretaker?.village }}</view>
          <view class="text-sm opacity-80 mt-1">{{ caretaker?.phone }}</view>
        </view>
      </view>
    </view>

    <!-- Stats -->
    <view class="px-4 -mt-4">
      <view class="card flex justify-around py-4">
        <view class="text-center">
          <view class="text-2xl font-bold text-primary">{{ fieldCount }}</view>
          <view class="text-xs text-muted-foreground mt-1">负责田地</view>
        </view>
        <view class="text-center">
          <view class="text-2xl font-bold text-primary">{{ taskCount }}</view>
          <view class="text-xs text-muted-foreground mt-1">待处理任务</view>
        </view>
        <view class="text-center">
          <view class="text-2xl font-bold text-primary">-</view>
          <view class="text-xs text-muted-foreground mt-1">累计养护</view>
        </view>
      </view>
    </view>

    <!-- Menu -->
    <view class="p-4">
      <view class="card">
        <button class="w-full flex items-center justify-between py-3 border-b border-border">
          <view class="flex items-center gap-3">
            <text class="text-xl">📊</text>
            <text class="text-foreground">养护统计</text>
          </view>
          <text class="text-muted-foreground">›</text>
        </button>
        <button class="w-full flex items-center justify-between py-3 border-b border-border">
          <view class="flex items-center gap-3">
            <text class="text-xl">⚙️</text>
            <text class="text-foreground">设置</text>
          </view>
          <text class="text-muted-foreground">›</text>
        </button>
        <button class="w-full flex items-center justify-between py-3">
          <view class="flex items-center gap-3">
            <text class="text-xl">❓</text>
            <text class="text-foreground">帮助与反馈</text>
          </view>
          <text class="text-muted-foreground">›</text>
        </button>
      </view>
    </view>

    <!-- Logout -->
    <view class="p-4">
      <button
        class="btn-secondary w-full h-12 text-red-500 border-red-200"
        @click="handleLogout"
      >
        退出登录
      </button>
    </view>

    <BottomNav :active="activeTab" @navigate="handleNav" />
  </view>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add caretaker-app/src/pages/caretaker-profile/index.vue
git commit -m "feat(caretaker): add profile page with logout"
```

---

## Task 11: 路由守卫和权限控制

**Files:**
- Create: `caretaker-app/src/middleware/authGuard.ts`
- Modify: `caretaker-app/src/App.vue`

- [ ] **Step 1: Create authGuard.ts**

```typescript
import { isLoggedIn } from './services/authApi'

// Pages that require login
const AUTH_PAGES = [
  'pages/caretaker-login/index'
]

// Pages that should redirect to home if already logged in
const REDIRECT_IF_LOGGED_IN = [
  'pages/caretaker-login/index'
]

export function checkAuth(path: string): string | null {
  const isAuth = AUTH_PAGES.some(page => path.includes(page))
  const isRedirect = REDIRECT_IF_LOGGED_IN.some(page => path.includes(page))
  const loggedIn = isLoggedIn()

  if (isAuth && loggedIn && !isRedirect) {
    return '/pages/caretaker-home/index'
  }

  if (!isAuth && !loggedIn) {
    return '/pages/caretaker-login/index'
  }

  return null
}
```

- [ ] **Step 2: Update App.vue**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { checkAuth } from './middleware/authGuard'

onMounted(() => {
  // Simple routing simulation - in real uniapp this would be handled by the framework
  const currentPath = '/pages/caretaker-login/index'
  const redirect = checkAuth(currentPath)
  if (redirect) {
    // Would handle navigation in real app
    console.log('Redirect to:', redirect)
  }
})
</script>

<template>
  <view class="min-h-dvh bg-background">
    <RouterView />
  </view>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add caretaker-app/src/middleware/authGuard.ts caretaker-app/src/App.vue
git commit -m "feat(caretaker): add auth guard for route protection"
```

---

## 验收标准

1. **登录页** — 养护员可以输入手机号和验证码登录，测试验证码 123456
2. **首页任务** — 登录后显示养护员负责的田地任务列表，按紧急程度排序
3. **田地详情** — 可以查看田地详细信息和养护记录
4. **养护记录** — 可以选择动作类型（浇水/除草/施肥等）并提交记录
5. **扫码** — 可以扫描田地二维码快速进入养护记录页
6. **地图** — 可以看到田地分布地图，点击标记查看详情
7. **个人中心** — 可以查看养护员信息和统计数据，支持退出登录
8. **视觉风格** — 与 FarmStar 用户端保持一致的绿色主题和卡片布局

---

## 依赖关系

```
Task 1 (项目初始化)
    ↓
Task 2 (类型和数据) ← 需要 Task 1 完成
    ↓
Task 3 (登录认证) ← 需要 Task 2 完成
    ↓
Task 4 (页面框架) ← 需要 Task 3 完成
    ↓
Task 5-10 (各页面实现) ← 可以并行，但都依赖 Task 4
    ↓
Task 11 (路由守卫) ← 需要所有页面完成
```
