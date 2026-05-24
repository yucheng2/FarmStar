<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { Field } from '../types/garden'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
    return { latitude: 39.917, longitude: 116.403 }
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

// 小程序/App 地图标记点
const markers = computed(() => {
  return mapFields.value.map((field, index) => ({
    id: index,
    latitude: field.location!.latitude,
    longitude: field.location!.longitude,
    title: field.name,
    iconPath: field.status === 'idle' ? '/static/marker-green.png' : '/static/marker-dark.png',
    width: 28,
    height: 28,
    callout: {
      content: field.name,
      color: '#14532D',
      fontSize: 12,
      borderRadius: 4,
      bgColor: '#ffffff',
      padding: 4,
      display: 'ALWAYS'
    }
  }))
})

function onMarkerTap(e: { detail: { markerId: number } }) {
  const field = mapFields.value[e.detail.markerId]
  if (field) emit('markerTap', field)
}

function onFieldTap(field: Field) {
  emit('markerTap', field)
}

function statusColor(status: Field['status']) {
  if (status === 'idle') return '#22C55E'
  if (status === 'adopted') return '#15803D'
  if (status === 'ready_to_harvest') return '#A16207'
  return '#64748B'
}

// H5 地图相关 (Leaflet)
const mapContainerId = 'h5-map-container'
let h5Map: L.Map | null = null

function initH5Map() {
  if (typeof window === 'undefined') return

  const container = document.getElementById(mapContainerId)
  if (!container) return

  // 如果已经初始化过，先销毁
  if (h5Map) {
    h5Map.remove()
    h5Map = null
  }

  h5Map = L.map(mapContainerId, {
    center: [center.value.latitude, center.value.longitude],
    zoom: scale.value,
    zoomControl: true
  })

  // 添加 OpenStreetMap 瓦片层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(h5Map)

  // 添加标记点
  mapFields.value.forEach((field) => {
    if (!field.location) return

    const color = statusColor(field.status)
    const marker = L.circleMarker([field.location.latitude, field.location.longitude], {
      radius: 12,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1
    })

    marker.bindPopup(`
      <div style="min-width: 120px;">
        <strong style="font-size: 14px; color: #14532D;">${field.name}</strong>
        <div style="font-size: 12px; color: #64748B; margin-top: 4px;">
          ${field.status === 'idle' ? '可认养' : field.status === 'adopted' ? '已认养' : field.status === 'ready_to_harvest' ? '待收获' : '维护中'}
        </div>
        <div style="font-size: 11px; color: #64748B; margin-top: 2px;">面积: ${field.areaSquareMeters}㎡</div>
      </div>
    `)

    marker.on('click', () => {
      emit('markerTap', field)
    })

    marker.addTo(h5Map!)
  })
}

function destroyH5Map() {
  if (h5Map) {
    h5Map.remove()
    h5Map = null
  }
}

onMounted(() => {
  // 等待 DOM 就绪后初始化 Leaflet
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      initH5Map()
    }, 100)
  }
})

onUnmounted(() => {
  destroyH5Map()
})
</script>

<template>
  <!-- #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY -->
  <view style="margin: 16px 16px 0; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md);">
    <map
      style="width: 100%; height: 400px;"
      :latitude="center.latitude"
      :longitude="center.longitude"
      :scale="scale"
      :markers="markers"
      @markertap="onMarkerTap"
    />
  </view>
  <!-- #endif -->

  <!-- #ifdef H5 -->
  <view style="margin: 16px 16px 0; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md);">
    <view
      id="h5-map-container"
      style="width: 100%; height: 400px;"
    />
  </view>
  <!-- #endif -->

  <!-- 图例 -->
  <view style="margin: 8px 16px 0; display: flex; flex-wrap: wrap; gap: 6px;">
    <view style="display: flex; align-items: center; gap: 4px;">
      <view style="width: 8px; height: 8px; border-radius: 9999px; background: #22C55E;" />
      <view style="font-size: 11px; color: var(--color-muted-foreground);">可认养</view>
    </view>
    <view style="display: flex; align-items: center; gap: 4px;">
      <view style="width: 8px; height: 8px; border-radius: 9999px; background: #15803D;" />
      <view style="font-size: 11px; color: var(--color-muted-foreground);">已认养</view>
    </view>
    <view style="display: flex; align-items: center; gap: 4px;">
      <view style="width: 8px; height: 8px; border-radius: 9999px; background: #A16207;" />
      <view style="font-size: 11px; color: var(--color-muted-foreground);">待收获</view>
    </view>
    <view style="display: flex; align-items: center; gap: 4px;">
      <view style="width: 8px; height: 8px; border-radius: 9999px; background: #64748B;" />
      <view style="font-size: 11px; color: var(--color-muted-foreground);">维护中</view>
    </view>
  </view>
</template>
