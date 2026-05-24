<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
  actionText?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="card flex flex-col items-center text-center gap-3 py-10">
    <!-- Icon -->
    <view
      style="width: 64px; height: 64px; border-radius: 9999px; background: rgb(21 128 61 / 0.08); display: flex; align-items: center; justify-content: center;"
    >
      <view
        style="width: 32px; height: 32px; border-radius: 9999px; border: 2px solid var(--color-primary); opacity: 0.4;"
      />
    </view>

    <view class="text-foreground text-lg font-bold">{{ title }}</view>
    <view class="text-muted-foreground text-sm" style="max-width: 260px;">{{ description }}</view>

    <button
      v-if="actionText"
      class="btn-primary w-full h-11 mt-2"
      @click="emit('action')"
    >
      {{ actionText }}
    </button>
  </view>
</template>
