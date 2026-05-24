<script setup lang="ts">
import type { Caretaker } from '../types/garden'

const props = defineProps<{
  caretaker: Caretaker
  selected: boolean
}>()

const emit = defineEmits<{
  select: [caretaker: Caretaker]
  detail: [caretaker: Caretaker]
}>()

function selectCaretaker() {
  emit('select', props.caretaker)
}

function showDetail() {
  emit('detail', props.caretaker)
}
</script>

<template>
  <view
    class="caretaker-card shrink-0 mr-3 p-2 rounded-xl bg-card text-center border-2 transition-colors duration-150 cursor-pointer"
    style="width: 92px;"
    :class="selected ? 'border-primary' : 'border-transparent'"
    @click="selectCaretaker"
  >
    <view
      class="rounded-lg bg-primary/10 mx-auto overflow-hidden"
      style="width: 72px; height: 72px;"
    >
      <image
        style="width: 72px; height: 72px;"
        mode="aspectFill"
        :src="caretaker.avatarUrl"
        :alt="caretaker.name"
        lazy-load
      />
    </view>
    <view class="mt-1 text-foreground text-sm font-bold">{{ caretaker.name }}</view>
    <view class="mt-0.5 text-muted-foreground text-xs">{{ caretaker.rating.toFixed(1) }} ★</view>
    <view class="mt-0.5 text-muted-foreground text-xs">{{ caretaker.experienceYears }}年经验</view>
    <view
      class="rounded-full bg-primary/10 text-primary text-xs border-0 cursor-pointer transition-all duration-150 hover:bg-primary/20 flex items-center justify-center"
      style="height: 26px; margin-top: 6px; padding: 0 8px;"
      data-test="caretaker-detail"
      @click.stop="showDetail"
    >
      详情
    </view>
  </view>
</template>
