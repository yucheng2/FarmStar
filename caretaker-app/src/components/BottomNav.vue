<script setup lang="ts">
defineProps<{
  active: 'home' | 'map' | 'scan' | 'profile'
}>()

const emit = defineEmits<{
  navigate: [tab: 'home' | 'map' | 'scan' | 'profile']
}>()

const tabs = [
  { key: 'home', label: '首页' },
  { key: 'map', label: '地图' },
  { key: 'scan', label: '扫码' },
  { key: 'profile', label: '我的' }
] as const
</script>

<template>
  <view class="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom">
    <view class="flex justify-around items-center h-16">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex flex-col items-center justify-center gap-1 p-2 min-w-[64px]"
        :class="active === tab.key ? 'text-primary' : 'text-muted-foreground'"
        @click="emit('navigate', tab.key)"
      >
        <!-- Home Icon -->
        <svg v-if="tab.key === 'home'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        <!-- Map Icon -->
        <svg v-else-if="tab.key === 'map'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/>
          <path d="M15 5.764v15"/>
          <path d="M9 3.236v15"/>
        </svg>
        <!-- Scan Icon -->
        <svg v-else-if="tab.key === 'scan'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
          <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
          <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
          <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
          <rect width="8" height="8" x="8" y="8" rx="1"/>
        </svg>
        <!-- Profile Icon -->
        <svg v-else-if="tab.key === 'profile'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="5"/>
          <path d="M20 21a8 8 0 0 0-16 0"/>
        </svg>
        <text class="text-xs font-medium">{{ tab.label }}</text>
      </button>
    </view>
  </view>
</template>
