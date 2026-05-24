<script setup lang="ts">
import type { TaskItem } from '../../services/caretakerApi'

defineProps<{
  task: TaskItem
}>()

const emit = defineEmits<{
  tap: [task: TaskItem]
}>()

function formatDate(dateStr?: string): string {
  if (!dateStr) return '从未'
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  return `${diffDays}天前`
}
</script>

<template>
  <view
    class="card mb-3"
    :class="task.urgency === 'high' ? 'border-l-4 border-red-500' : task.urgency === 'medium' ? 'border-l-4 border-yellow-500' : ''"
    @click="emit('tap', task)"
  >
    <view class="flex gap-3">
      <image
        v-if="task.field.imageUrl"
        :src="task.field.imageUrl"
        class="w-20 h-20 rounded-lg object-cover"
        :alt="task.field.name"
      />
      <view v-else class="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
        <text class="text-3xl">🌱</text>
      </view>

      <view class="flex-1">
        <view class="flex items-center justify-between">
          <text class="font-bold text-foreground">{{ task.field.name }}</text>
          <view
            v-if="task.urgency === 'high'"
            class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs"
          >
            紧急
          </view>
          <view
            v-else-if="task.urgency === 'medium'"
            class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-600 text-xs"
          >
            提醒
          </view>
        </view>

        <view class="text-sm text-muted-foreground mt-1">
          {{ task.field.code }} · {{ task.field.areaSquareMeters }}㎡
        </view>

        <view v-if="task.field.crop" class="text-sm text-primary mt-1">
          {{ task.field.crop.name }} · {{ task.field.crop.progressPercent }}%
        </view>

        <view class="flex items-center justify-between mt-2">
          <view class="text-xs text-muted-foreground">
            最后养护: {{ formatDate(task.lastCareAt) }}
          </view>
          <view v-if="task.adoptionCount > 0" class="text-xs text-muted-foreground">
            {{ task.adoptionCount }}人认养
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
