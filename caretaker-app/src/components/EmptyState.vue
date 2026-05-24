<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  actionText?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <text class="text-4xl mb-4">📭</text>
    <view class="text-lg font-medium text-foreground mb-2">{{ title }}</view>
    <view v-if="description" class="text-sm text-muted-foreground mb-4">{{ description }}</view>
    <button v-if="actionText" class="btn-primary" @click="emit('action')">
      {{ actionText }}
    </button>
  </view>
</template>
