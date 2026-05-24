<script setup lang="ts">
import type { Field } from '../../types/garden'

defineProps<{
  field: Field
}>()
</script>

<template>
  <view class="card">
    <view class="flex gap-3">
      <image
        v-if="field.imageUrl"
        :src="field.imageUrl"
        class="w-24 h-24 rounded-lg object-cover"
        :alt="field.name"
      />
      <view v-else class="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center">
        <text class="text-4xl">🌱</text>
      </view>

      <view class="flex-1">
        <view class="font-bold text-foreground">{{ field.name }}</view>
        <view class="text-sm text-muted-foreground mt-1">
          {{ field.code }} · {{ field.areaSquareMeters }}㎡
        </view>
        <view class="mt-2">
          <view
            class="inline-block px-2 py-0.5 rounded-full text-xs"
            :class="{
              'bg-green-100 text-green-700': field.status === 'idle',
              'bg-blue-100 text-blue-700': field.status === 'adopted',
              'bg-yellow-100 text-yellow-700': field.status === 'ready_to_harvest',
              'bg-orange-100 text-orange-700': field.status === 'maintenance'
            }"
          >
            {{ field.status === 'idle' ? '空闲' : field.status === 'adopted' ? '已认养' : field.status === 'ready_to_harvest' ? '待收获' : '养护中' }}
          </view>
        </view>
        <view v-if="field.crop" class="mt-2">
          <view class="text-sm text-primary">{{ field.crop.name }}</view>
          <view class="flex items-center gap-2 mt-1">
            <view class="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <view
                class="h-full bg-primary rounded-full"
                :style="{ width: `${field.crop.progressPercent}%` }"
              />
            </view>
            <text class="text-xs text-muted-foreground">{{ field.crop.progressPercent }}%</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
