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
    class="caretaker-card w-[92px] shrink-0 mr-3 p-2 rounded-xl bg-card text-center border-2 transition-colors duration-150 cursor-pointer"
    :class="selected ? 'border-primary' : 'border-transparent'"
    @click="selectCaretaker"
  >
    <image
      class="w-[72px] h-[72px] rounded-lg bg-primary/10 object-cover mx-auto transition-transform duration-200 active:scale-95"
      :src="caretaker.avatarUrl"
      :alt="caretaker.name"
    />
    <text class="block mt-1 text-foreground text-sm font-bold">{{ caretaker.name }}</text>
    <text class="block mt-0.5 text-muted-foreground text-xs">{{ caretaker.rating.toFixed(1) }} ★</text>
    <text class="block mt-0.5 text-muted-foreground text-xs">{{ caretaker.experienceYears }}年经验</text>
    <button
      class="h-[26px] mt-1.5 px-2 rounded-full bg-primary/10 text-primary text-xs border-0 cursor-pointer transition-all duration-150 hover:bg-primary/20"
      data-test="caretaker-detail"
      @click.stop="showDetail"
    >
      详情
    </button>
  </view>
</template>
