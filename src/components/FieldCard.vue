<script setup lang="ts">
import type { Field } from '../types/garden'

const props = defineProps<{
  field: Field
}>()

const emit = defineEmits<{
  adopt: [field: Field]
  details: [field: Field]
  caretaker: [caretaker: Field['caretaker']]
}>()

const statusText: Record<Field['status'], string> = {
  idle: '空闲',
  adopted: '已认养',
  ready_to_harvest: '待收获',
  maintenance: '维护中'
}

const statusColorMap: Record<Field['status'], string> = {
  idle: 'bg-primary',
  adopted: 'bg-sky-500',
  ready_to_harvest: 'bg-amber-500',
  maintenance: 'bg-gray-400'
}

const actionText = props.field.status === 'idle' ? '立即认养' : '查看详情'

function emitAction() {
  if (props.field.status === 'idle') {
    emit('adopt', props.field)
    return
  }

  emit('details', props.field)
}

function emitCaretaker() {
  if (props.field.caretaker) emit('caretaker', props.field.caretaker)
}
</script>

<template>
  <view
    class="card mx-4 mt-4 border border-border transition-shadow duration-200 hover:shadow-lg"
    data-test="field-card"
  >
    <view class="flex flex-col gap-2">
      <!-- Header -->
      <view class="flex items-center justify-between">
        <text class="text-foreground text-base font-bold">{{ field.name }}</text>
        <image
          v-if="field.caretaker"
          class="w-20 h-20 rounded-lg bg-primary/10 object-cover cursor-pointer transition-transform duration-200 active:scale-95"
          data-test="caretaker-avatar"
          :src="field.caretaker.avatarUrl"
          :alt="field.caretaker.name"
          @click.stop="emitCaretaker"
        />
      </view>

      <!-- Meta -->
      <view class="flex items-center gap-3 text-muted-foreground text-xs">
        <text>面积：{{ field.areaSquareMeters }}㎡</text>
        <text
          class="px-2 py-0.5 rounded-full text-white text-xs"
          :class="statusColorMap[field.status]"
        >
          {{ statusText[field.status] }}
        </text>
      </view>

      <!-- Crop Row -->
      <view v-if="field.crop" class="flex items-center gap-2 text-foreground text-sm">
        <image class="w-6 h-6" :src="field.crop.iconUrl" :alt="field.crop.name" />
        <text>{{ field.crop.name }}</text>
        <view class="w-[90px] h-2 overflow-hidden rounded-full bg-border">
          <view
            class="h-full bg-primary rounded-full transition-all duration-300"
            :style="{ width: `${field.crop.progressPercent}%` }"
          />
        </view>
        <text class="text-xs">{{ field.crop.progressPercent }}%</text>
      </view>
      <view v-else class="text-foreground text-sm">
        可种植：蔬菜/水果
      </view>

      <!-- Footer -->
      <view class="flex items-center justify-between mt-1">
        <text class="text-muted-foreground text-xs">
          预计收获：{{ field.expectedHarvestDate ?? '--' }}
        </text>
        <button
          class="btn-primary h-[34px] px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          data-test="field-action"
          :disabled="field.status === 'maintenance'"
          @click.stop="emitAction"
        >
          {{ actionText }}
        </button>
      </view>
    </view>
  </view>
</template>
