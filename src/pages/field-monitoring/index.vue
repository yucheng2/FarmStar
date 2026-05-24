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
