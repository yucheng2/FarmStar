<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { Field } from '../types/garden'

const props = defineProps<{
  fields: Field[]
}>()

const emit = defineEmits<{
  markerTap: [field: Field]
}>()

const mapFields = computed(() => {
  return props.fields.filter((field) => field.location)
})

// 计算地图中心点
const center = computed(() => {
  if (mapFields.value.length === 0) {
    // 默认中心点（mock数据范围的中间位置）
    return { latitude: 39.913, longitude: 116.406 }
  }
  const sum = mapFields.value.reduce(
    (acc, field) => ({
      lat: acc.lat + field.location!.latitude,
      lng: acc.lng + field.location!.longitude
    }),
    { lat: 0, lng: 0 }
  )
  return {
    latitude: sum.lat / mapFields.value.length,
    longitude: sum.lng / mapFields.value.length
  }
})

// 计算缩放级别
const scale = computed(() => {
  if (mapFields.value.length <= 1) return 15
  const lats = mapFields.value.map((f) => f.location!.latitude)
  const lngs = mapFields.value.map((f) => f.location!.longitude)
  const latDiff = Math.max(...lats) - Math.min(...lats)
  const lngDiff = Math.max(...lngs) - Math.min(...lngs)
  const maxDiff = Math.max(latDiff, lngDiff)
  if (maxDiff < 0.01) return 16
  if (maxDiff < 0.05) return 14
  if (maxDiff < 0.1) return 13
  return 12
})

function statusColor(status: Field['status']) {
  if (status === 'idle') return '#22C55E'
  if (status === 'adopted') return '#15803D'
  if (status === 'ready_to_harvest') return '#A16207'
  return '#64748B'
}

// 高德地图
declare const AMap: any
const mapContainerId = 'h5-map-container'
let h5Map: any = null

function initH5Map() {
  if (typeof window === 'undefined' || typeof AMap === 'undefined') return

  const container = document.getElementById(mapContainerId)
  if (!container) return

  if (h5Map) {
    h5Map.destroy()
    h5Map = null
  }

  h5Map = new AMap.Map(mapContainerId, {
    center: [center.value.longitude, center.value.latitude],
    zoom: scale.value,
    viewMode: '2D',
    zoomControl: true
  })

  // 如果没有田地数据，添加测试标记
  if (mapFields.value.length === 0) {
    const testMarker = new AMap.Marker({
      position: [116.406, 39.913],
      content: '<div style="width:28px;height:28px;background:#15803D;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;">测</div>',
      offset: new AMap.Pixel(-14, -14)
    })
    h5Map.add(testMarker)
    return
  }

  mapFields.value.forEach((field) => {
    if (!field.location) return

    const color = statusColor(field.status)

    const markerContent = `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        ${field.name.charAt(0)}
      </div>
    `

    const marker = new AMap.Marker({
      position: [field.location.longitude, field.location.latitude],
      content: markerContent,
      offset: new AMap.Pixel(-14, -14)
    })

    AMap.Event.addListener(marker, 'click', () => {
      emit('markerTap', field)
    })

    h5Map.add(marker)
  })
}

function destroyH5Map() {
  if (h5Map) {
    h5Map.destroy()
    h5Map = null
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const tryInit = () => {
      console.log('AMap available:', typeof AMap !== 'undefined')
      console.log('Container:', document.getElementById(mapContainerId))
      console.log('mapFields:', mapFields.value.length)
      if (typeof AMap !== 'undefined') {
        initH5Map()
      } else {
        setTimeout(tryInit, 500)
      }
    }
    tryInit()
  }
})

onUnmounted(() => {
  destroyH5Map()
})
</script>

<template>
  <view class="map-wrapper">
    <view
      id="h5-map-container"
      style="width: 100%; height: 280px; border-radius: 12px; overflow: hidden;"
    />

    <!-- 图例 -->
    <view style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding: 0 4px;">
      <view style="display: flex; align-items: center; gap: 4px;">
        <view style="width: 8px; height: 8px; border-radius: 9999px; background: #22C55E;" />
        <text style="font-size: 11px; color: var(--color-muted-foreground);">空闲</text>
      </view>
      <view style="display: flex; align-items: center; gap: 4px;">
        <view style="width: 8px; height: 8px; border-radius: 9999px; background: #15803D;" />
        <text style="font-size: 11px; color: var(--color-muted-foreground);">已认养</text>
      </view>
      <view style="display: flex; align-items: center; gap: 4px;">
        <view style="width: 8px; height: 8px; border-radius: 9999px; background: #A16207;" />
        <text style="font-size: 11px; color: var(--color-muted-foreground);">待收获</text>
      </view>
      <view style="display: flex; align-items: center; gap: 4px;">
        <view style="width: 8px; height: 8px; border-radius: 9999px; background: #64748B;" />
        <text style="font-size: 11px; color: var(--color-muted-foreground);">维护中</text>
      </view>
    </view>
  </view>
</template>
