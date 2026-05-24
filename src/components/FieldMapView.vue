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

// H5 地图相关 (高德地图)
declare const AMap: any
const mapContainerId = 'h5-map-container'
let h5Map: any = null

function initH5Map() {
  if (typeof window === 'undefined' || typeof AMap === 'undefined') return

  const container = document.getElementById(mapContainerId)
  if (!container) return

  // 如果已经初始化过，先销毁
  if (h5Map) {
    h5Map.destroy()
    h5Map = null
  }

  h5Map = new AMap.Map(mapContainerId, {
    center: [center.value.longitude, center.value.latitude], // 高德是 [lng, lat]
    zoom: scale.value,
    viewMode: '2D',
    zoomControl: true
  })

  // 添加标记点
  mapFields.value.forEach((field) => {
    if (!field.location) return

    const color = statusColor(field.status)

    // 创建标记点
    const marker = new AMap.Marker({
      position: [field.location.longitude, field.location.latitude],
      title: field.name,
      icon: new AMap.Icon({
        size: new AMap.Size(32, 32),
        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
        imageSize: new AMap.Size(32, 32)
      }),
      offset: new AMap.Pixel(-16, -32)
    })

    // 创建信息窗体
    const infoWindow = new AMap.InfoWindow({
      content: `
        <div style="min-width: 120px; padding: 8px;">
          <strong style="font-size: 14px; color: #14532D;">${field.name}</strong>
          <div style="font-size: 12px; color: #64748B; margin-top: 4px;">
            ${field.status === 'idle' ? '可认养' : field.status === 'adopted' ? '已认养' : field.status === 'ready_to_harvest' ? '待收获' : '维护中'}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">面积: ${field.areaSquareMeters}㎡</div>
        </div>
      `,
      offset: new AMap.Pixel(0, -32)
    })

    marker.on('click', () => {
      infoWindow.open(h5Map, marker.getPosition())
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
  // 等待 DOM 就绪后初始化高德地图
  if (typeof window !== 'undefined') {
    const tryInit = () => {
      if (typeof AMap !== 'undefined') {
        initH5Map()
      }
    }
    if (typeof AMap !== 'undefined') {
      tryInit()
    } else {
      setTimeout(tryInit, 500)
    }
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
