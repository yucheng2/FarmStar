# Field 002 Live Monitoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `field-002` show an opened real-time monitoring card with an external video while all other unavailable monitoring features remain unchanged.

**Architecture:** Keep the feature data-driven through the existing `FieldMonitoringDetail` shape. `field-002` returns `monitoringStatus: 'live'`, `cameraStatus: 'online'`, and `liveStreamUrl`; the page renders a video player only when those fields are present, otherwise it uses the existing unavailable state.

**Tech Stack:** Vue 3 `<script setup>`, uni-app H5 components/styles, TypeScript domain types, Vitest + Vue Test Utils, Fastify server repository tests.

---

## File Structure

- Modify `src/mocks/gardenData.ts`: derive live monitoring fields for `field-002` in the existing `fieldMonitoringDetails` factory.
- Modify `server/repositories/gardenRepository.ts`: return live monitoring metadata for `field-002` from the API-backed monitoring detail.
- Modify `src/pages/field-monitoring/index.vue`: replace the live placeholder with a real video block and visual live status metadata.
- Modify `tests/pages/fieldMonitoring.test.ts`: update the page test to assert live monitoring for `field-002` and keep unavailable behavior covered for other fields.
- Modify `tests/server/gardenRoutes.test.ts`: update API assertions for `field-002` to expect live/online/video URL while preserving unavailable assertions for fields without live monitoring.

Use this video URL consistently in all tasks:

```ts
const FIELD_002_LIVE_STREAM_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
```

This is an external MP4 suitable for browser playback in H5 demos.

---

### Task 1: Make mock monitoring data report field-002 as live

**Files:**
- Modify: `src/mocks/gardenData.ts:348-367`
- Test: `tests/pages/fieldMonitoring.test.ts`

- [ ] **Step 1: Write the failing page test expectation**

In `tests/pages/fieldMonitoring.test.ts`, update the first test to expect live monitoring instead of the unavailable message:

```ts
  it('renders live monitoring detail for field-002 with snapshots and care logs', async () => {
    vi.mocked(getFieldMonitoring).mockResolvedValueOnce(fieldMonitoringDetails['field-002'])

    const wrapper = mount(FieldMonitoringPage, { props: { fieldId: 'field-002' } })
    await flushPromises()

    expect(getFieldMonitoring).toHaveBeenCalledWith('field-002')
    expect(wrapper.text()).toContain('田地监控')
    expect(wrapper.text()).toContain('我的小菜园')
    expect(wrapper.text()).toContain('西红柿')
    expect(wrapper.text()).toContain('生长进度 60%')
    expect(wrapper.text()).toContain('李伯')
    expect(wrapper.text()).toContain('实时画面直播中')
    expect(wrapper.text()).toContain('摄像头在线')
    expect(wrapper.text()).not.toContain('实时监控暂未开放')
    expect(wrapper.find('[data-test="live-monitoring-video"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="live-monitoring-video"]').attributes('src')).toBe('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4')
    expect(wrapper.text()).toContain('清晨巡田照片，西红柿长势稳定')
    expect(wrapper.text()).toContain('浇水')
    expect(wrapper.text()).toContain('今日上午完成滴灌补水，土壤湿度正常。')
  })
```

- [ ] **Step 2: Run the page test to verify it fails**

Run:

```bash
npm test -- tests/pages/fieldMonitoring.test.ts
```

Expected: FAIL because `fieldMonitoringDetails['field-002']` still has `monitoringStatus: 'snapshot'`, no `liveStreamUrl`, and the page still renders the unavailable copy.

- [ ] **Step 3: Add a shared mock live URL constant and set field-002 live fields**

In `src/mocks/gardenData.ts`, add this export near the other top-level exports, before `fieldMonitoringDetails`:

```ts
export const field002LiveStreamUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
```

Then replace the object returned inside `fieldMonitoringDetails` with this exact code:

```ts
      {
        field,
        caretaker: field.caretaker,
        monitoringStatus: field.id === 'field-002' ? 'live' : media.length > 0 ? 'snapshot' : 'unavailable',
        cameraStatus: field.id === 'field-002' ? 'online' : 'not_installed',
        latestSnapshotUrl: latestMedia?.url,
        latestSnapshotAt: latestMedia?.capturedAt,
        liveStreamUrl: field.id === 'field-002' ? field002LiveStreamUrl : undefined,
        media,
        careLogs: careLogs[field.id] ?? []
      }
```

- [ ] **Step 4: Run the page test again**

Run:

```bash
npm test -- tests/pages/fieldMonitoring.test.ts
```

Expected: still FAIL because the page live branch only shows `实时画面已接入` and has no video node or `摄像头在线` copy yet.

- [ ] **Step 5: Commit**

Do not commit yet if the suite is failing. This task intentionally leaves the UI implementation for Task 2.

---

### Task 2: Render the live video card in the field monitoring page

**Files:**
- Modify: `src/pages/field-monitoring/index.vue:96-112`
- Test: `tests/pages/fieldMonitoring.test.ts`

- [ ] **Step 1: Replace the live placeholder with a video presentation**

In `src/pages/field-monitoring/index.vue`, replace the current real-time monitoring card body:

```vue
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
```

with this exact code:

```vue
        <view class="text-foreground text-base font-bold">实时监控</view>
        <view v-if="monitoring.monitoringStatus === 'live' && monitoring.liveStreamUrl" style="position: relative; overflow: hidden; border-radius: 14px; background: #111827;">
          <video
            data-test="live-monitoring-video"
            style="display: block; width: 100%; height: 180px; object-fit: cover; background: #111827;"
            :src="monitoring.liveStreamUrl"
            autoplay
            muted
            loop
            playsinline
            controls
          />
          <view style="position: absolute; left: 10px; top: 10px; display: flex; align-items: center; gap: 6px; border-radius: 9999px; background: rgb(220 38 38 / 0.92); padding: 4px 8px; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.04em;">
            <view style="width: 6px; height: 6px; border-radius: 9999px; background: #ffffff;" />
            LIVE
          </view>
          <view style="position: absolute; left: 10px; right: 10px; bottom: 10px; display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; color: #ffffff; text-shadow: 0 1px 8px rgb(0 0 0 / 0.45);">
            <view>
              <view style="font-size: 14px; font-weight: 700;">实时画面直播中</view>
              <view style="margin-top: 2px; font-size: 11px; opacity: 0.86;">{{ monitoring.field.code }} 摄像头</view>
            </view>
            <view style="border-radius: 9999px; background: rgb(22 163 74 / 0.92); padding: 4px 8px; font-size: 11px; font-weight: 700;">
              摄像头在线
            </view>
          </view>
        </view>
        <view v-else style="padding: 14px; border-radius: 14px; background: rgb(21 128 61 / 0.08);">
          <view class="text-foreground text-sm font-bold">实时监控暂未开放</view>
          <view class="text-muted-foreground text-xs" style="margin-top: 4px;">
            当前展示管护员定期更新的照片、短视频和管护记录。
          </view>
        </view>
        <view class="text-muted-foreground text-xs">
          摄像头状态：{{ monitoring.cameraStatus === 'not_installed' ? '暂未安装' : monitoring.cameraStatus === 'online' ? '在线' : '离线' }}
        </view>
        <view v-if="monitoring.latestSnapshotAt" class="text-muted-foreground text-xs">
          最近更新：{{ monitoring.latestSnapshotAt }}
        </view>
```

- [ ] **Step 2: Run the page test**

Run:

```bash
npm test -- tests/pages/fieldMonitoring.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/mocks/gardenData.ts src/pages/field-monitoring/index.vue tests/pages/fieldMonitoring.test.ts
git commit -m "feat: open live monitoring for field 002"
```

Expected: commit succeeds. If a hook runs and fails, fix the failing issue and create a new commit; do not amend unless explicitly requested.

---

### Task 3: Sync API repository behavior with the live mock data

**Files:**
- Modify: `server/repositories/gardenRepository.ts:176-188`
- Modify: `tests/server/gardenRoutes.test.ts:340-350`

- [ ] **Step 1: Write the failing server API assertions**

In `tests/server/gardenRoutes.test.ts`, update the successful `field-002` monitoring expectation to include live status. The assertion block should include these expectations:

```ts
    expect(body).toMatchObject({
      field: { id: 'field-002', name: '我的小菜园' },
      caretaker: { id: 'caretaker-li', name: '李伯' },
      monitoringStatus: 'live',
      cameraStatus: 'online',
      liveStreamUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
    })
```

Keep the existing assertions that verify media and care logs are returned.

- [ ] **Step 2: Run the server test to verify it fails**

Run:

```bash
npm test -- tests/server/gardenRoutes.test.ts
```

Expected: FAIL because the repository still derives `field-002` as `snapshot` with `cameraStatus: 'not_installed'` and no `liveStreamUrl`.

- [ ] **Step 3: Add the live URL and field-002 branch to the repository**

In `server/repositories/gardenRepository.ts`, add this constant near the top-level constants/imports:

```ts
const field002LiveStreamUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
```

Then replace the monitoring detail return fields:

```ts
      monitoringStatus: media.length > 0 ? 'snapshot' : 'unavailable',
      cameraStatus: 'not_installed',
      latestSnapshotUrl: media[0]?.url,
      latestSnapshotAt: media[0]?.capturedAt,
      media,
      careLogs
```

with this exact code:

```ts
      monitoringStatus: field.id === 'field-002' ? 'live' : media.length > 0 ? 'snapshot' : 'unavailable',
      cameraStatus: field.id === 'field-002' ? 'online' : 'not_installed',
      latestSnapshotUrl: media[0]?.url,
      latestSnapshotAt: media[0]?.capturedAt,
      liveStreamUrl: field.id === 'field-002' ? field002LiveStreamUrl : undefined,
      media,
      careLogs
```

- [ ] **Step 4: Run the server test**

Run:

```bash
npm test -- tests/server/gardenRoutes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add server/repositories/gardenRepository.ts tests/server/gardenRoutes.test.ts
git commit -m "fix: sync field 002 live monitoring API"
```

Expected: commit succeeds. If a hook runs and fails, fix the failing issue and create a new commit; do not amend unless explicitly requested.

---

### Task 4: Verify regression scope

**Files:**
- Test only: all modified test targets and full suite

- [ ] **Step 1: Run focused page test**

Run:

```bash
npm test -- tests/pages/fieldMonitoring.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run focused server test**

Run:

```bash
npm test -- tests/server/gardenRoutes.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Manually verify in browser if a dev server is already running**

Do not start or restart a dev server automatically. If the existing H5 dev server is available, open:

```text
http://localhost:5173/#/pages/field-monitoring/index?field_id=field-002
```

Expected: the real-time monitoring card shows the external video, LIVE badge, `实时画面直播中`, and online camera state. The page should still show recent images and care logs below. Other unavailable actions elsewhere remain unchanged.

- [ ] **Step 5: Final status check**

Run:

```bash
git status --short
```

Expected: no unexpected files. If the user did not request commits during execution, skip the commit steps above and leave changes uncommitted for review.

---

## Self-Review

- Spec coverage: Task 1 opens field-002 in mock data, Task 2 renders the live video UI, Task 3 syncs API behavior, Task 4 verifies focused and full regressions.
- Placeholder scan: no TBD/TODO/fill-in-later placeholders remain.
- Type consistency: all tasks use existing `FieldMonitoringDetail.liveStreamUrl`, `MonitoringStatus: 'live'`, and `CameraStatus: 'online'` names from `src/types/garden.ts`.
