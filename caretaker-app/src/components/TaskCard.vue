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
    class="card mb-3 cursor-pointer transition-all duration-150 active:scale-[0.98]"
    :class="task.urgency === 'high' ? 'border-l-4 border-red-500' : task.urgency === 'medium' ? 'border-l-4 border-yellow-500' : ''"
    @click="emit('tap', task)"
  >
    <view class="flex gap-3">
      <img
        v-if="task.field.imageUrl"
        :src="task.field.imageUrl"
        class="w-20 h-20 rounded-xl object-cover"
        :alt="task.field.name"
      />
      <view v-else class="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
        <svg class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 20h10"/>
          <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
          <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
        </svg>
      </view>

      <view class="flex-1 min-w-0">
        <view class="flex items-center justify-between gap-2">
          <text class="font-bold text-foreground truncate">{{ task.field.name }}</text>
          <view
            v-if="task.urgency === 'high'"
            class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium whitespace-nowrap"
          >
            紧急
          </view>
          <view
            v-else-if="task.urgency === 'medium'"
            class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-600 text-xs font-medium whitespace-nowrap"
          >
            提醒
          </view>
        </view>

        <view class="text-sm text-muted-foreground mt-1">
          {{ task.field.code }} · {{ task.field.areaSquareMeters }}㎡
        </view>

        <view v-if="task.field.crop" class="text-sm text-primary font-medium mt-1">
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
