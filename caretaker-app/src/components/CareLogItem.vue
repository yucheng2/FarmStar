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
