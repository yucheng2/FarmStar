<script setup lang="ts">
const props = defineProps<{
  type: 'card' | 'text' | 'avatar' | 'button'
  lines?: number
}>()
</script>

<template>
  <!-- Card Skeleton -->
  <view v-if="type === 'card'" class="card mx-4 mt-4" style="opacity: 0.7;">
    <view class="flex flex-col gap-3">
      <!-- Header -->
      <view class="flex items-center justify-between">
        <view style="width: 120px; height: 20px; background: var(--color-muted); border-radius: 4px;" />
        <view style="width: 48px; height: 48px; background: var(--color-muted); border-radius: 8px;" />
      </view>
      <!-- Meta -->
      <view class="flex items-center gap-2">
        <view style="width: 80px; height: 14px; background: var(--color-muted); border-radius: 4px;" />
        <view style="width: 48px; height: 20px; background: var(--color-muted); border-radius: 9999px;" />
      </view>
      <!-- Crop -->
      <view class="flex items-center gap-2">
        <view style="width: 24px; height: 24px; background: var(--color-muted); border-radius: 9999px;" />
        <view style="width: 60px; height: 14px; background: var(--color-muted); border-radius: 4px;" />
        <view style="flex: 1; height: 8px; background: var(--color-muted); border-radius: 9999px;" />
      </view>
      <!-- Footer -->
      <view class="flex items-center justify-between mt-1">
        <view style="width: 100px; height: 12px; background: var(--color-muted); border-radius: 4px;" />
        <view style="width: 80px; height: 34px; background: var(--color-muted); border-radius: 9999px;" />
      </view>
    </view>
  </view>

  <!-- Text Skeleton -->
  <view v-else-if="type === 'text'" class="flex flex-col gap-2">
    <view
      v-for="n in (lines || 3)"
      :key="n"
      :style="{
        width: n === (lines || 3) ? '60%' : '100%',
        height: '14px',
        background: 'var(--color-muted)',
        borderRadius: '4px'
      }"
    />
  </view>

  <!-- Avatar Skeleton -->
  <view v-else-if="type === 'avatar'" class="flex flex-col items-center gap-2">
    <view style="width: 72px; height: 72px; background: var(--color-muted); border-radius: 12px;" />
    <view style="width: 48px; height: 14px; background: var(--color-muted); border-radius: 4px;" />
  </view>

  <!-- Button Skeleton -->
  <view v-else-if="type === 'button'" style="width: 100%; height: 44px; background: var(--color-muted); border-radius: 9999px;" />
</template>
