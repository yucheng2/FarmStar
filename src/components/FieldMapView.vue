<script setup lang="ts">
import { computed } from 'vue'
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

function onFieldTap(field: Field) {
  emit('markerTap', field)
}

function statusColor(status: Field['status']) {
  if (status === 'idle') return '#22C55E'
  if (status === 'adopted') return '#15803D'
  if (status === 'ready_to_harvest') return '#A16207'
  return '#64748B'
}
</script>

<template>
  <view style="margin: 16px 16px 0; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md);">
    <view style="width: 100%; height: 400px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%); position: relative; display: flex; align-items: center; justify-content: center;">
      <view style="position: absolute; inset: 0; opacity: 0.3;">
        <view v-for="n in 8" :key="n" style="position: absolute; width: 100%; height: 1px; background: #81c784;" :style="{ top: `${n * 12.5}%` }" />
        <view v-for="n in 8" :key="`v-${n}`" style="position: absolute; width: 1px; height: 100%; background: #81c784;" :style="{ left: `${n * 12.5}%` }" />
      </view>

      <view
        v-for="field in mapFields"
        :key="field.id"
        style="position: absolute; display: flex; flex-direction: column; align-items: center; cursor: pointer;"
        :style="{
          left: `${15 + ((field.location!.longitude - 116.403) / 0.008) * 70}%`,
          top: `${15 + ((39.917 - field.location!.latitude) / 0.008) * 70}%`
        }"
        @click="onFieldTap(field)"
      >
        <view style="width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
          :style="{ backgroundColor: statusColor(field.status) }"
        >
          {{ field.name.charAt(0) }}
        </view>
        <view style="margin-top: 2px; background: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #14532D; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,0.1); white-space: nowrap;"
        >
          {{ field.name }}
        </view>
      </view>

      <view style="position: absolute; bottom: 8px; left: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 8px; font-size: 11px; color: var(--color-muted-foreground);">
        H5 模拟地图 · 小程序/App 显示真地图
      </view>
    </view>
  </view>

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
