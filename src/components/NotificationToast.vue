<script setup lang="ts">
import { onMounted, ref } from 'vue'

export type NotificationType = 'success' | 'info' | 'warning'

export type Notification = {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}

const props = defineProps<{
  notifications: Notification[]
}>()

const emit = defineEmits<{
  dismiss: [id: string]
  markRead: [id: string]
}>()

const visible = ref(true)

function typeColor(type: NotificationType) {
  if (type === 'success') return '#15803D'
  if (type === 'warning') return '#B45309'
  return '#64748B'
}

function typeBg(type: NotificationType) {
  if (type === 'success') return 'rgb(21 128 61 / 0.08)'
  if (type === 'warning') return 'rgb(180 83 9 / 0.08)'
  return 'rgb(100 116 139 / 0.08)'
}
</script>

<template>
  <view
    v-if="visible && notifications.length > 0"
    style="position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 8px 16px; display: flex; flex-direction: column; gap: 6px;"
  >
    <view
      v-for="notification in notifications.filter(n => !n.read).slice(0, 3)"
      :key="notification.id"
      style="background: white; border-radius: 12px; padding: 10px 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items: flex-start; gap: 10px; animation: slideDown 0.3s ease-out;"
      @click="emit('markRead', notification.id)"
    >
      <view
        style="width: 8px; height: 8px; border-radius: 9999px; margin-top: 6px; flex-shrink: 0;"
        :style="{ backgroundColor: typeColor(notification.type) }"
      />
      <view style="flex: 1; min-width: 0;">
        <view style="font-size: 13px; font-weight: 600; color: var(--color-foreground);">
          {{ notification.title }}
        </view>
        <view style="font-size: 12px; color: var(--color-muted-foreground); margin-top: 2px;">
          {{ notification.message }}
        </view>
      </view>
      <view
        style="font-size: 18px; color: var(--color-muted-foreground); line-height: 1; padding: 2px; cursor: pointer;"
        @click.stop="emit('dismiss', notification.id)"
      >
        ×
      </view>
    </view>
  </view>
</template>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
