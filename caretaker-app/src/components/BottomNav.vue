<script setup lang="ts">
defineProps<{
  active: 'home' | 'map' | 'scan' | 'profile'
}>()

const emit = defineEmits<{
  navigate: [tab: 'home' | 'map' | 'scan' | 'profile']
}>()

const tabs = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'map', label: '地图', icon: '🗺️' },
  { key: 'scan', label: '扫码', icon: '📷' },
  { key: 'profile', label: '我的', icon: '👤' }
] as const
</script>

<template>
  <view class="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
    <view class="flex justify-around items-center h-16">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex flex-col items-center justify-center gap-1 p-2"
        :class="active === tab.key ? 'text-primary' : 'text-muted-foreground'"
        @click="emit('navigate', tab.key)"
      >
        <text class="text-xl">{{ tab.icon }}</text>
        <text class="text-xs">{{ tab.label }}</text>
      </button>
    </view>
  </view>
</template>
