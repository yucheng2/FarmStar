<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
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

// H5 地图相关
const mapContainer = ref<HTMLDivElement | null>(null)
let h5Map: any = null

function initH5Map() {
  if (typeof window === 'undefined' || !(window as any).TMap) return

  const TMap = (window as any).TMap

  h5Map = new TMap.Map(mapContainer.value, {
    center: new TMap.LatLng(center.value.latitude, center.value.longitude),
    zoom: scale.value,
    mapStyleId: 'style1'
  })

  // 添加标记点
  const markerList = mapFields.value.map((field) => ({
    id: field.id,
    position: new TMap.LatLng(field.location!.latitude, field.location!.longitude),
    properties: { field }
  }))

  if (markerList.length > 0) {
    const markerLayer = new TMap.MultiMarker({
      map: h5Map,
      styles: {
        default: new TMap.MarkerStyle({
          width: 28,
          height: 28,
          anchor: { x: 14, y: 28 },
          color: '#15803D'
        })
      },
      geometries: markerList
    })

    markerLayer.on('click', (e: any) => {
      const field = e.geometry.properties.field as Field
      if (field) emit('markerTap', field)
    })
  }
}

function destroyH5Map() {
  if (h5Map) {
    h5Map.destroy()
    h5Map = null
  }
}

onMounted(() => {
  // 延迟初始化，确保地图脚本加载完成
  if (typeof window !== 'undefined' && (window as any).TMap) {
    initH5Map()
  } else {
    const checkInterval = setInterval(() => {
      if ((window as any).TMap) {
        clearInterval(checkInterval)
        initH5Map()
      }
    }, 500)
    // 10秒后停止检查
    setTimeout(() => clearInterval(checkInterval), 10000)
  }
})

onUnmounted(() => {
  destroyH5Map()
})

// H5 模拟地图：计算相对位置（作为 fallback）
const h5Markers = computed(() => {
  if (mapFields.value.length === 0) return []

  const lats = mapFields.value.map((f) => f.location!.latitude)
  const lngs = mapFields.value.map((f) => f.location!.longitude)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  const latRange = maxLat - minLat || 0.001
  const lngRange = maxLng - minLng || 0.001

  const padding = 0.15

  return mapFields.value.map((field) => ({
    field,
    left: `${padding + ((field.location!.longitude - minLng) / lngRange) * (1 - padding * 2) * 100}%`,
    top: `${padding + ((maxLat - field.location!.latitude) / latRange) * (1 - padding * 2) * 100}%`
  }))
})

const mapLoadFailed = ref(false)

function onMapError() {
  mapLoadFailed.value = true
}
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
    <!-- 真实地图容器 -->
    <view
      v-show="!mapLoadFailed"
      ref="mapContainer"
      style="width: 100%; height: 400px;"
      @error="onMapError"
    />

    <!-- Fallback 模拟地图 -->
    <view
      v-if="mapLoadFailed"
      style="width: 100%; height: 400px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%); position: relative; display: flex; align-items: center; justify-content: center;"
    >
      <!-- 网格背景 -->
      <view style="position: absolute; inset: 0; opacity: 0.3;">
        <view
          v-for="n in 8"
          :key="n"
          style="position: absolute; width: 100%; height: 1px; background: #81c784;"
          :style="{ top: `${n * 12.5}%` }"
        />
        <view
          v-for="n in 8"
          :key="`v-${n}`"
          style="position: absolute; width: 1px; height: 100%; background: #81c784;"
          :style="{ left: `${n * 12.5}%` }"
        />
      </view>

      <!-- 田地标记 -->
      <view
        v-for="marker in h5Markers"
        :key="marker.field.id"
        style="position: absolute; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%); z-index: 10;"
        :style="{ left: marker.left, top: marker.top }"
        @click="onFieldTap(marker.field)"
      >
        <view
          style="width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid white;"
          :style="{ backgroundColor: statusColor(marker.field.status) }"
        >
          {{ marker.field.name.charAt(0) }}
        </view>
        <view
          style="margin-top: 4px; background: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; color: #14532D; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,0.1); white-space: nowrap;"
        >
          {{ marker.field.name }}
        </view>
      </view>

      <view
        style="position: absolute; bottom: 8px; left: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 8px; font-size: 11px; color: var(--color-muted-foreground);"
      >
        地图加载失败，显示模拟地图
      </view>
    </view>
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
