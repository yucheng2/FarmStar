# Field Monitoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a V1 “田地监控” experience for adopted fields that shows field status, crop progress, caretaker information, recent media, care logs, and a clear placeholder for future live camera support.

**Architecture:** Extend the existing garden domain types with a `FieldMonitoringDetail` aggregate returned by a new `GET /api/fields/:fieldId/monitoring` endpoint. The frontend adds a registered `pages/field-monitoring/index` page that fetches this aggregate via `gardenApi`, while the garden detail modal and adoption detail page navigate to it for adopted fields.

**Tech Stack:** Vue 3 + uni-app pages/components, TypeScript domain types, Fastify API, better-sqlite3 seed data/repository, Vitest + Vue Test Utils.

---

## File Structure

- Modify `src/types/garden.ts`: define monitoring status/camera status/media/log/detail types.
- Modify `src/mocks/gardenData.ts`: export deterministic monitoring fixtures keyed by `fieldId`.
- Modify `server/database/schema.sql`: add normalized `field_monitoring_media` and `field_care_logs` tables.
- Modify `server/database/seed.ts`: seed monitoring fixtures into the new tables and keep existing databases migratable.
- Modify `server/repositories/gardenRepository.ts`: map monitoring rows and expose `getFieldMonitoring(fieldId)`.
- Modify `server/app.ts`: add `GET /api/fields/:fieldId/monitoring`.
- Modify `src/services/gardenApi.ts`: export `getFieldMonitoring(fieldId)`.
- Create `src/pages/field-monitoring/index.vue`: render the monitoring page.
- Modify `src/pages.json`: register `pages/field-monitoring/index`.
- Modify `src/pages/garden/index.vue`: add “查看田地监控” from adopted field detail.
- Modify `src/pages/adoption/detail.vue`: add “查看田地监控” action for active/pending/completed adopted records.
- Modify tests:
  - `tests/server/gardenRoutes.test.ts`
  - `tests/services/gardenApi.test.ts`
  - `tests/pages/garden.test.ts`
  - `tests/pages/adoptionDetail.test.ts`
  - Create `tests/pages/fieldMonitoring.test.ts`

---

### Task 1: Domain Types and Mock Monitoring Fixtures

**Files:**
- Modify: `src/types/garden.ts`
- Modify: `src/mocks/gardenData.ts`
- Test: type-check covered by later Vitest runs

- [ ] **Step 1: Extend garden monitoring types**

In `src/types/garden.ts`, after `export type AdoptionStatus = ...`, add:

```ts
export type MonitoringStatus = 'unavailable' | 'snapshot' | 'live'
export type CameraStatus = 'online' | 'offline' | 'not_installed'
export type MonitoringMediaType = 'image' | 'video'
```

After `export type FieldLocation = { ... }`, add:

```ts
export type MonitoringMedia = {
  id: string
  type: MonitoringMediaType
  url: string
  capturedAt: string
  caption: string
}

export type CareLog = {
  id: string
  action: string
  note: string
  createdAt: string
  caretakerName: string
}
```

After `export type AdoptionListItem = Adoption & { ... }`, add:

```ts
export type FieldMonitoringDetail = {
  field: Field
  caretaker?: CaretakerSummary
  monitoringStatus: MonitoringStatus
  cameraStatus: CameraStatus
  latestSnapshotUrl?: string
  latestSnapshotAt?: string
  liveStreamUrl?: string
  media: MonitoringMedia[]
  careLogs: CareLog[]
}
```

- [ ] **Step 2: Add deterministic monitoring fixtures**

In `src/mocks/gardenData.ts`, change the import to:

```ts
import type { CareLog, Caretaker, Field, FieldMonitoringDetail, MonitoringMedia } from '../types/garden'
```

At the end of the file, after the `fields` export, add:

```ts
export const monitoringMedia: MonitoringMedia[] = [
  {
    id: 'media-field-002-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&h=480&fit=crop',
    capturedAt: '2026-05-24T08:30:00+08:00',
    caption: '清晨巡田照片，西红柿长势稳定'
  },
  {
    id: 'media-field-002-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&h=480&fit=crop',
    capturedAt: '2026-05-23T17:20:00+08:00',
    caption: '傍晚补水后拍摄'
  },
  {
    id: 'media-field-006-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=480&fit=crop',
    capturedAt: '2026-05-24T09:10:00+08:00',
    caption: '苹果幼果检查完成'
  },
  {
    id: 'media-field-008-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1536617621572-1d5f1e6269a0?w=800&h=480&fit=crop',
    capturedAt: '2026-05-24T07:50:00+08:00',
    caption: '水稻田水位正常'
  }
]

export const careLogs: Record<string, CareLog[]> = {
  'field-002': [
    {
      id: 'care-log-field-002-001',
      action: '浇水',
      note: '今日上午完成滴灌补水，土壤湿度正常。',
      createdAt: '2026-05-24T09:00:00+08:00',
      caretakerName: '李伯'
    },
    {
      id: 'care-log-field-002-002',
      action: '除草',
      note: '已清理田垄边杂草，避免影响西红柿生长。',
      createdAt: '2026-05-23T16:40:00+08:00',
      caretakerName: '李伯'
    }
  ],
  'field-006': [
    {
      id: 'care-log-field-006-001',
      action: '巡检',
      note: '检查苹果幼果和枝叶，暂未发现病虫害。',
      createdAt: '2026-05-24T09:20:00+08:00',
      caretakerName: '吴伯'
    }
  ],
  'field-008': [
    {
      id: 'care-log-field-008-001',
      action: '水位检查',
      note: '水稻田水位保持稳定，今日无需额外补水。',
      createdAt: '2026-05-24T08:05:00+08:00',
      caretakerName: '张叔'
    }
  ]
}

export const fieldMonitoringDetails: Record<string, FieldMonitoringDetail> = Object.fromEntries(
  fields.map((field) => {
    const media = monitoringMedia.filter((item) => item.id.includes(field.id))
    const latestMedia = media[0]

    return [
      field.id,
      {
        field,
        caretaker: field.caretaker,
        monitoringStatus: media.length > 0 ? 'snapshot' : 'unavailable',
        cameraStatus: 'not_installed',
        latestSnapshotUrl: latestMedia?.url,
        latestSnapshotAt: latestMedia?.capturedAt,
        media,
        careLogs: careLogs[field.id] ?? []
      }
    ]
  })
)
```

- [ ] **Step 3: Run targeted tests to catch type/import failures**

Run:

```bash
npm test -- tests/pages/garden.test.ts
```

Expected: PASS. No TypeScript import errors from `src/mocks/gardenData.ts` or `src/types/garden.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/types/garden.ts src/mocks/gardenData.ts
git commit -m "feat: add field monitoring domain fixtures"
```

---

### Task 2: Backend Monitoring Repository and Route

**Files:**
- Modify: `server/database/schema.sql`
- Modify: `server/database/seed.ts`
- Modify: `server/repositories/gardenRepository.ts`
- Modify: `server/app.ts`
- Test: `tests/server/gardenRoutes.test.ts`

- [ ] **Step 1: Write failing route tests**

Append these tests before the closing `})` in `tests/server/gardenRoutes.test.ts`:

```ts
  it('returns monitoring detail for adopted field', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/field-002/monitoring' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      field: { id: 'field-002', name: '我的小菜园', status: 'adopted' },
      caretaker: { id: 'caretaker-li', name: '李伯' },
      monitoringStatus: 'snapshot',
      cameraStatus: 'not_installed',
      latestSnapshotUrl: expect.stringContaining('https://images.unsplash.com/'),
      careLogs: [
        expect.objectContaining({ action: '浇水', caretakerName: '李伯' }),
        expect.objectContaining({ action: '除草', caretakerName: '李伯' })
      ]
    })
    expect(response.json().media[0]).toMatchObject({ type: 'image', caption: '清晨巡田照片，西红柿长势稳定' })
  })

  it('returns unavailable monitoring detail for field without updates', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/field-001/monitoring' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      field: { id: 'field-001', status: 'idle' },
      monitoringStatus: 'unavailable',
      cameraStatus: 'not_installed',
      media: [],
      careLogs: []
    })
  })

  it('returns not found for missing field monitoring detail', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/missing-field/monitoring' })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: '田地不存在' })
  })
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/server/gardenRoutes.test.ts
```

Expected: FAIL with 404 for `/api/fields/field-002/monitoring` because the route does not exist.

- [ ] **Step 3: Add monitoring tables to schema**

In `server/database/schema.sql`, after the `adoptions` table, add:

```sql
CREATE TABLE IF NOT EXISTS field_monitoring_media (
  id TEXT PRIMARY KEY,
  field_id TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  caption TEXT NOT NULL,
  FOREIGN KEY (field_id) REFERENCES fields(id)
);

CREATE TABLE IF NOT EXISTS field_care_logs (
  id TEXT PRIMARY KEY,
  field_id TEXT NOT NULL,
  action TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL,
  caretaker_name TEXT NOT NULL,
  FOREIGN KEY (field_id) REFERENCES fields(id)
);
```

Before the final user index, add:

```sql
CREATE INDEX IF NOT EXISTS idx_monitoring_media_field ON field_monitoring_media(field_id);
CREATE INDEX IF NOT EXISTS idx_care_logs_field ON field_care_logs(field_id);
```

- [ ] **Step 4: Seed monitoring tables and keep old DBs migratable**

In `server/database/seed.ts`, change the import to:

```ts
import { caretakers, careLogs, fields, monitoringMedia } from '../../src/mocks/gardenData'
```

At the start of `seedDatabase`, after the existing `image_url` migration block, add:

```ts
  db.prepare(`
    CREATE TABLE IF NOT EXISTS field_monitoring_media (
      id TEXT PRIMARY KEY,
      field_id TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      caption TEXT NOT NULL,
      FOREIGN KEY (field_id) REFERENCES fields(id)
    )
  `).run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS field_care_logs (
      id TEXT PRIMARY KEY,
      field_id TEXT NOT NULL,
      action TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL,
      caretaker_name TEXT NOT NULL,
      FOREIGN KEY (field_id) REFERENCES fields(id)
    )
  `).run()

  db.prepare('CREATE INDEX IF NOT EXISTS idx_monitoring_media_field ON field_monitoring_media(field_id)').run()
  db.prepare('CREATE INDEX IF NOT EXISTS idx_care_logs_field ON field_care_logs(field_id)').run()
```

After `syncImageAssets(db)` and before `return`, call a new helper:

```ts
    syncMonitoringData(db)
```

Add this helper below `syncImageAssets`:

```ts
function syncMonitoringData(db: Database.Database): void {
  const insertMedia = db.prepare(`
    INSERT OR REPLACE INTO field_monitoring_media (id, field_id, type, url, captured_at, caption)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  for (const media of monitoringMedia) {
    const fieldId = media.id.replace(/^media-/, '').replace(/-\d+$/, '')
    insertMedia.run(media.id, fieldId, media.type, media.url, media.capturedAt, media.caption)
  }

  const insertCareLog = db.prepare(`
    INSERT OR REPLACE INTO field_care_logs (id, field_id, action, note, created_at, caretaker_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  for (const [fieldId, logs] of Object.entries(careLogs)) {
    for (const log of logs) {
      insertCareLog.run(log.id, fieldId, log.action, log.note, log.createdAt, log.caretakerName)
    }
  }
}
```

After the seed adoption loop, call:

```ts
  syncMonitoringData(db)
```

- [ ] **Step 5: Implement repository mapper and method**

In `server/repositories/gardenRepository.ts`, update imports to include:

```ts
  CareLog,
  FieldMonitoringDetail,
  MonitoringMedia,
```

After `rowToField`, add:

```ts
function rowToMonitoringMedia(row: Record<string, unknown>): MonitoringMedia {
  return {
    id: String(row.id),
    type: String(row.type) as MonitoringMedia['type'],
    url: String(row.url),
    capturedAt: String(row.captured_at),
    caption: String(row.caption)
  }
}

function rowToCareLog(row: Record<string, unknown>): CareLog {
  return {
    id: String(row.id),
    action: String(row.action),
    note: String(row.note),
    createdAt: String(row.created_at),
    caretakerName: String(row.caretaker_name)
  }
}
```

Inside `createGardenRepository`, after `getFieldById`, add:

```ts
  function getFieldMonitoring(fieldId: string): FieldMonitoringDetail {
    const field = getFieldById(fieldId)
    const mediaRows = db.prepare(`
      SELECT * FROM field_monitoring_media WHERE field_id = ? ORDER BY captured_at DESC
    `).all(fieldId) as Record<string, unknown>[]
    const careLogRows = db.prepare(`
      SELECT * FROM field_care_logs WHERE field_id = ? ORDER BY created_at DESC
    `).all(fieldId) as Record<string, unknown>[]
    const media = mediaRows.map(rowToMonitoringMedia)
    const latestMedia = media[0]

    return {
      field,
      caretaker: field.caretaker,
      monitoringStatus: media.length > 0 ? 'snapshot' : 'unavailable',
      cameraStatus: 'not_installed',
      latestSnapshotUrl: latestMedia?.url,
      latestSnapshotAt: latestMedia?.capturedAt,
      media,
      careLogs: careLogRows.map(rowToCareLog)
    }
  }
```

In the returned object, add:

```ts
    getFieldMonitoring,
```

- [ ] **Step 6: Add Fastify route**

In `server/app.ts`, after the `/api/fields/:fieldId` route and before `/api/fields/:fieldId/recommended-caretakers`, add:

```ts
  app.get<{ Params: { fieldId: string } }>('/api/fields/:fieldId/monitoring', async (request, reply) => {
    try {
      return gRepo!.getFieldMonitoring(request.params.fieldId)
    } catch (caughtError) {
      sendError(reply, caughtError, 404)
    }
  })
```

- [ ] **Step 7: Run backend tests**

Run:

```bash
npm test -- tests/server/gardenRoutes.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add server/database/schema.sql server/database/seed.ts server/repositories/gardenRepository.ts server/app.ts tests/server/gardenRoutes.test.ts
git commit -m "feat: add field monitoring API"
```

---

### Task 3: Frontend API Client

**Files:**
- Modify: `src/services/gardenApi.ts`
- Test: `tests/services/gardenApi.test.ts`

- [ ] **Step 1: Write failing API client test**

Update the import in `tests/services/gardenApi.test.ts` to include `getFieldMonitoring`:

```ts
  getFieldMonitoring,
```

After the existing `requests adoption by id` test, add:

```ts
  it('requests field monitoring detail by field id', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ field: { id: 'field-002' }, monitoringStatus: 'snapshot', media: [], careLogs: [] }) })

    const monitoring = await getFieldMonitoring('field-002')

    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3000/api/fields/field-002/monitoring', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
      body: undefined
    })
    expect(monitoring.field.id).toBe('field-002')
    expect(monitoring.monitoringStatus).toBe('snapshot')
  })
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm test -- tests/services/gardenApi.test.ts
```

Expected: FAIL because `getFieldMonitoring` is not exported.

- [ ] **Step 3: Implement API client function**

In `src/services/gardenApi.ts`, add `FieldMonitoringDetail` to the type import list:

```ts
  FieldMonitoringDetail,
```

After `getFieldById`, add:

```ts
export async function getFieldMonitoring(fieldId: string): Promise<FieldMonitoringDetail> {
  return request(`/api/fields/${fieldId}/monitoring`)
}
```

- [ ] **Step 4: Run API client tests**

Run:

```bash
npm test -- tests/services/gardenApi.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/gardenApi.ts tests/services/gardenApi.test.ts
git commit -m "feat: add field monitoring client"
```

---

### Task 4: Field Monitoring Page

**Files:**
- Create: `src/pages/field-monitoring/index.vue`
- Modify: `src/pages.json`
- Test: `tests/pages/fieldMonitoring.test.ts`

- [ ] **Step 1: Write failing page tests**

Create `tests/pages/fieldMonitoring.test.ts`:

```ts
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FieldMonitoringPage from '../../src/pages/field-monitoring/index.vue'
import { fieldMonitoringDetails } from '../../src/mocks/gardenData'
import { getFieldMonitoring } from '../../src/services/gardenApi'

vi.mock('../../src/services/gardenApi', () => ({
  getFieldMonitoring: vi.fn()
}))

describe('FieldMonitoringPage', () => {
  beforeEach(() => {
    vi.mocked(uni.navigateTo).mockClear()
    vi.mocked(getFieldMonitoring).mockReset()
  })

  it('renders monitoring detail for a field with snapshots and care logs', async () => {
    vi.mocked(getFieldMonitoring).mockResolvedValueOnce(fieldMonitoringDetails['field-002'])

    const wrapper = mount(FieldMonitoringPage, { props: { fieldId: 'field-002' } })
    await flushPromises()

    expect(getFieldMonitoring).toHaveBeenCalledWith('field-002')
    expect(wrapper.text()).toContain('田地监控')
    expect(wrapper.text()).toContain('我的小菜园')
    expect(wrapper.text()).toContain('西红柿')
    expect(wrapper.text()).toContain('生长进度 60%')
    expect(wrapper.text()).toContain('李伯')
    expect(wrapper.text()).toContain('实时监控暂未开放')
    expect(wrapper.text()).toContain('清晨巡田照片，西红柿长势稳定')
    expect(wrapper.text()).toContain('浇水')
    expect(wrapper.text()).toContain('今日上午完成滴灌补水，土壤湿度正常。')
  })

  it('accepts field_id prop', async () => {
    vi.mocked(getFieldMonitoring).mockResolvedValueOnce(fieldMonitoringDetails['field-002'])

    mount(FieldMonitoringPage, { props: { field_id: 'field-002' } })
    await flushPromises()

    expect(getFieldMonitoring).toHaveBeenCalledWith('field-002')
  })

  it('shows unavailable state when there are no monitoring updates', async () => {
    vi.mocked(getFieldMonitoring).mockResolvedValueOnce(fieldMonitoringDetails['field-001'])

    const wrapper = mount(FieldMonitoringPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    expect(wrapper.text()).toContain('暂无监控更新')
    expect(wrapper.text()).toContain('管护员更新后会在这里展示照片、短视频和管护记录。')
  })

  it('shows not found state when field id is missing', async () => {
    const wrapper = mount(FieldMonitoringPage)
    await flushPromises()

    expect(getFieldMonitoring).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('未找到田地监控')
  })

  it('shows error state when loading fails', async () => {
    vi.mocked(getFieldMonitoring).mockRejectedValueOnce(new Error('田地不存在'))

    const wrapper = mount(FieldMonitoringPage, { props: { fieldId: 'missing-field' } })
    await flushPromises()

    expect(wrapper.text()).toContain('田地监控加载失败')
    expect(wrapper.text()).toContain('田地不存在')
  })

  it('returns to garden', async () => {
    vi.mocked(getFieldMonitoring).mockResolvedValueOnce(fieldMonitoringDetails['field-002'])

    const wrapper = mount(FieldMonitoringPage, { props: { fieldId: 'field-002' } })
    await flushPromises()
    await wrapper.get('[data-test="return-garden"]').trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/garden/index' })
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm test -- tests/pages/fieldMonitoring.test.ts
```

Expected: FAIL because `src/pages/field-monitoring/index.vue` does not exist.

- [ ] **Step 3: Implement monitoring page**

Create `src/pages/field-monitoring/index.vue`:

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getFieldMonitoring } from '../../services/gardenApi'
import { trackEvent } from '../../services/analytics'
import type { FieldMonitoringDetail } from '../../types/garden'

const props = defineProps<{
  fieldId?: string
  field_id?: string
}>()

const monitoring = ref<FieldMonitoringDetail | null>(null)
const loading = ref(false)
const notFound = ref(false)
const error = ref('')

const resolvedFieldId = computed(() => props.fieldId ?? props.field_id ?? '')
const hasUpdates = computed(() => Boolean(monitoring.value && (monitoring.value.media.length > 0 || monitoring.value.careLogs.length > 0)))

async function loadMonitoring() {
  loading.value = true
  notFound.value = false
  error.value = ''

  if (!resolvedFieldId.value) {
    notFound.value = true
    loading.value = false
    return
  }

  try {
    monitoring.value = await getFieldMonitoring(resolvedFieldId.value)
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : '田地监控加载失败'
  } finally {
    loading.value = false
  }
}

function returnToGarden() {
  uni.navigateTo({ url: '/pages/garden/index' })
}

onMounted(() => {
  trackEvent({ event: 'page_view', userId: 'user-demo', pageName: 'field_monitoring', fieldId: resolvedFieldId.value })
  void loadMonitoring()
})
</script>

<template>
  <view class="min-h-dvh bg-background pb-6">
    <view style="display: flex; align-items: center; justify-content: space-between; margin: 0 16px; padding: 14px 0;">
      <view class="text-primary text-sm" style="width: 60px;" @click="returnToGarden">←</view>
      <view class="text-foreground text-lg font-bold">田地监控</view>
      <view style="width: 60px;" />
    </view>

    <view v-if="loading" style="margin: 40px 16px; text-align: center; color: var(--color-muted-foreground);">
      加载中...
    </view>

    <view v-else-if="notFound" class="card" style="margin: 16px;">
      <view class="text-foreground text-lg font-bold">未找到田地监控</view>
      <view class="text-muted-foreground text-sm" style="margin-top: 4px;">请返回田园重新选择已认养田地。</view>
      <button data-test="return-garden" class="btn-primary w-full h-11 mt-3" @click="returnToGarden">
        返回田园
      </button>
    </view>

    <view v-else-if="error" class="card" style="margin: 16px;">
      <view class="text-foreground text-lg font-bold">田地监控加载失败</view>
      <view class="text-muted-foreground text-sm" style="margin-top: 4px;">{{ error }}</view>
      <button data-test="return-garden" class="btn-primary w-full h-11 mt-3" @click="returnToGarden">
        返回田园
      </button>
    </view>

    <view v-else-if="monitoring" style="display: flex; flex-direction: column; gap: 12px; margin: 0 16px;">
      <view class="card" style="background: linear-gradient(135deg, rgb(21 128 61 / 0.08), #ffffff);">
        <view class="text-primary text-sm font-bold">田地监控</view>
        <view class="text-foreground text-xl font-bold" style="margin-top: 8px;">{{ monitoring.field.name }}</view>
        <view class="text-muted-foreground text-sm" style="margin-top: 4px;">
          {{ monitoring.field.code }} · 面积 {{ monitoring.field.areaSquareMeters }}㎡
        </view>
        <view v-if="monitoring.field.crop" class="text-foreground text-sm" style="margin-top: 8px;">
          作物：{{ monitoring.field.crop.name }} · 生长进度 {{ monitoring.field.crop.progressPercent }}%
        </view>
        <view v-if="monitoring.field.crop" style="height: 10px; overflow: hidden; border-radius: 9999px; background: var(--color-border); margin-top: 8px;">
          <view
            style="height: 100%; background: var(--color-primary); border-radius: 9999px;"
            :style="{ width: `${monitoring.field.crop.progressPercent}%` }"
          />
        </view>
      </view>

      <view class="card" style="display: flex; flex-direction: column; gap: 8px;">
        <view class="text-foreground text-base font-bold">实时监控</view>
        <view v-if="monitoring.monitoringStatus === 'live' && monitoring.liveStreamUrl" style="height: 180px; border-radius: 14px; background: #111827; color: #ffffff; display: flex; align-items: center; justify-content: center;">
          实时画面已接入
        </view>
        <view v-else style="padding: 14px; border-radius: 14px; background: rgb(21 128 61 / 0.08);">
          <view class="text-foreground text-sm font-bold">实时监控暂未开放</view>
          <view class="text-muted-foreground text-xs" style="margin-top: 4px;">
            当前展示管护员定期更新的照片、短视频和管护记录。
          </view>
        </view>
        <view class="text-muted-foreground text-xs">
          摄像头状态：{{ monitoring.cameraStatus === 'not_installed' ? '暂未安装' : monitoring.cameraStatus }}
        </view>
        <view v-if="monitoring.latestSnapshotAt" class="text-muted-foreground text-xs">
          最近更新：{{ monitoring.latestSnapshotAt }}
        </view>
      </view>

      <view v-if="monitoring.caretaker" class="card" style="display: flex; flex-direction: column; gap: 8px;">
        <view class="text-foreground text-base font-bold">管护员</view>
        <view style="display: flex; align-items: center; gap: 10px;">
          <image
            style="width: 48px; height: 48px; border-radius: 10px; background: rgb(21 128 61 / 0.1); object-fit: cover;"
            :src="monitoring.caretaker.avatarUrl"
            :alt="monitoring.caretaker.name"
          />
          <view style="display: flex; flex-direction: column; gap: 2px;">
            <view class="text-foreground text-sm font-bold">{{ monitoring.caretaker.name }}</view>
            <view class="text-primary text-xs font-bold">{{ monitoring.caretaker.rating.toFixed(1) }} ★ · {{ monitoring.caretaker.experienceYears }}年经验</view>
          </view>
        </view>
      </view>

      <view v-if="!hasUpdates" class="card">
        <view class="text-foreground text-base font-bold">暂无监控更新</view>
        <view class="text-muted-foreground text-sm" style="margin-top: 4px;">管护员更新后会在这里展示照片、短视频和管护记录。</view>
      </view>

      <view v-if="monitoring.media.length > 0" class="card" style="display: flex; flex-direction: column; gap: 10px;">
        <view class="text-foreground text-base font-bold">最近影像</view>
        <view v-for="media in monitoring.media" :key="media.id" style="display: flex; flex-direction: column; gap: 6px;">
          <image
            v-if="media.type === 'image'"
            style="width: 100%; height: 160px; border-radius: 14px; background: rgb(21 128 61 / 0.1); object-fit: cover;"
            mode="aspectFill"
            :src="media.url"
            :alt="media.caption"
            lazy-load
          />
          <view class="text-foreground text-sm font-bold">{{ media.caption }}</view>
          <view class="text-muted-foreground text-xs">{{ media.capturedAt }}</view>
        </view>
      </view>

      <view v-if="monitoring.careLogs.length > 0" class="card" style="display: flex; flex-direction: column; gap: 10px;">
        <view class="text-foreground text-base font-bold">管护记录</view>
        <view v-for="log in monitoring.careLogs" :key="log.id" style="padding: 10px; border-radius: 12px; background: rgb(21 128 61 / 0.06);">
          <view class="text-foreground text-sm font-bold">{{ log.action }}</view>
          <view class="text-muted-foreground text-sm" style="margin-top: 4px;">{{ log.note }}</view>
          <view class="text-muted-foreground text-xs" style="margin-top: 6px;">{{ log.caretakerName }} · {{ log.createdAt }}</view>
        </view>
      </view>

      <button data-test="return-garden" class="btn-secondary w-full h-11" @click="returnToGarden">
        返回田园
      </button>
    </view>
  </view>
</template>
```

- [ ] **Step 4: Register page**

In `src/pages.json`, insert this page object after `pages/adoption/detail`:

```json
    {
      "path": "pages/field-monitoring/index",
      "style": {
        "navigationBarTitleText": "田地监控"
      }
    },
```

- [ ] **Step 5: Run page test**

Run:

```bash
npm test -- tests/pages/fieldMonitoring.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/field-monitoring/index.vue src/pages.json tests/pages/fieldMonitoring.test.ts
git commit -m "feat: add field monitoring page"
```

---

### Task 5: Navigation Entrypoints

**Files:**
- Modify: `src/pages/garden/index.vue`
- Modify: `src/pages/adoption/detail.vue`
- Test: `tests/pages/garden.test.ts`
- Test: `tests/pages/adoptionDetail.test.ts`

- [ ] **Step 1: Write failing garden entry test**

In `tests/pages/garden.test.ts`, after `opens adoption detail from adopted field detail`, add:

```ts
  it('opens field monitoring from adopted field detail', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === '已被认养')?.trigger('click')
    await flushPromises()
    await wrapper.findAll('[data-test="field-action"]')[0].trigger('click')
    await wrapper.get('[data-test="view-field-monitoring"]').trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/field-monitoring/index?field_id=field-002' })
  })
```

- [ ] **Step 2: Write failing adoption detail entry test**

In `tests/pages/adoptionDetail.test.ts`, after `renders full adoption detail`, add:

```ts
  it('opens field monitoring from adoption detail', async () => {
    vi.mocked(getAdoptionById).mockResolvedValueOnce({
      id: 'adoption-field-002-caretaker-li',
      userId: 'user-demo',
      fieldId: 'field-002',
      caretakerId: 'caretaker-li',
      status: 'active',
      paymentOrderId: 'payment-field-002-caretaker-li',
      createdAt: '2026-05-23T10:00:00+08:00'
    })
    vi.mocked(getFieldById).mockResolvedValueOnce(fields[1])
    vi.mocked(getCaretakerById).mockResolvedValueOnce(caretakers[1])

    const wrapper = mount(AdoptionDetailPage, { props: { adoptionId: 'adoption-field-002-caretaker-li' } })
    await flushPromises()
    await wrapper.get('[data-test="view-field-monitoring"]').trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/field-monitoring/index?field_id=field-002' })
  })
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```bash
npm test -- tests/pages/garden.test.ts tests/pages/adoptionDetail.test.ts
```

Expected: FAIL because `[data-test="view-field-monitoring"]` does not exist.

- [ ] **Step 4: Add garden modal navigation**

In `src/pages/garden/index.vue`, after `viewFieldAdoption`, add:

```ts
function viewFieldMonitoring() {
  if (!selectedField.value) return
  uni.navigateTo({ url: `/pages/field-monitoring/index?field_id=${selectedField.value.id}` })
}
```

In the field detail modal, after the “查看认养状态” button, add:

```vue
        <button
          v-if="selectedField.adoptionId"
          data-test="view-field-monitoring"
          class="btn-secondary"
          style="height: 40px; margin-top: 8px;"
          @click="viewFieldMonitoring"
        >
          查看田地监控
        </button>
```

- [ ] **Step 5: Add adoption detail navigation**

In `src/pages/adoption/detail.vue`, after `goToPayment`, add:

```ts
function viewFieldMonitoring() {
  if (!field.value) return
  uni.navigateTo({ url: `/pages/field-monitoring/index?field_id=${field.value.id}` })
}
```

In the non-pending actions block, replace the single return button block with:

```vue
      <view v-else style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <button data-test="view-field-monitoring" class="btn-primary w-full h-11" @click="viewFieldMonitoring">
          查看田地监控
        </button>
        <button data-test="return-garden" class="btn-secondary w-full h-11" @click="returnToGarden">
          返回田园
        </button>
      </view>
```

In the pending-payment actions block, insert this button before “返回田园”:

```vue
        <button data-test="view-field-monitoring" class="btn-secondary w-full h-11" @click="viewFieldMonitoring">
          查看田地监控
        </button>
```

- [ ] **Step 6: Run entrypoint tests**

Run:

```bash
npm test -- tests/pages/garden.test.ts tests/pages/adoptionDetail.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/garden/index.vue src/pages/adoption/detail.vue tests/pages/garden.test.ts tests/pages/adoptionDetail.test.ts
git commit -m "feat: link adopted fields to monitoring"
```

---

### Task 6: Full Verification

**Files:**
- No code changes unless tests expose a defect.

- [ ] **Step 1: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build:h5
```

Expected: PASS and no TypeScript or Vue template errors.

- [ ] **Step 3: Manual UI check**

Do not start or restart dev servers automatically. If a server is already running, open the H5 app and verify:

1. Garden page → filter “已被认养” → open “我的小菜园”.
2. Modal shows “查看田地监控”.
3. Click opens `/pages/field-monitoring/index?field_id=field-002`.
4. Monitoring page shows:
   - “田地监控” title.
   - “我的小菜园”.
   - “生长进度 60%”.
   - “实时监控暂未开放”.
   - Recent image caption.
   - “浇水” care log.
5. Adoption detail page shows “查看田地监控” and navigates to the same page.

If no dev server is already running, report that automated tests and build passed but browser verification was not run because the project preference says not to start dev servers automatically.

- [ ] **Step 4: Commit any test/build fixes**

If Step 1 or Step 2 required fixes, commit them:

```bash
git add <changed-files>
git commit -m "fix: stabilize field monitoring verification"
```

---

## Self-Review

- Spec coverage: covered V1 monitoring page, garden/adoption entrypoints, basic information, growth progress, caretaker info, media, care logs, camera/live placeholders, backend data, client API, and tests.
- Placeholder scan: no TBD/TODO/fill-in-later instructions remain; all code steps include concrete snippets.
- Type consistency: `FieldMonitoringDetail`, `MonitoringMedia`, `CareLog`, `getFieldMonitoring`, `monitoringStatus`, `cameraStatus`, `latestSnapshotUrl`, `latestSnapshotAt`, `media`, and `careLogs` are used consistently across tasks.
