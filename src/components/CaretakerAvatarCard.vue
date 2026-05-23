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
  <view class="caretaker-card" :class="{ selected }" @click="selectCaretaker">
    <image class="avatar" :src="caretaker.avatarUrl" :alt="caretaker.name" />
    <text class="name">{{ caretaker.name }}</text>
    <text class="rating">{{ caretaker.rating.toFixed(1) }} ★</text>
    <text class="experience">{{ caretaker.experienceYears }}年经验</text>
    <button class="detail-button" data-test="caretaker-detail" @click.stop="showDetail">详情</button>
  </view>
</template>

<style scoped>
.caretaker-card {
  width: 92px;
  flex: 0 0 92px;
  margin-right: 12px;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #ffffff;
  text-align: center;
  box-sizing: border-box;
}

.caretaker-card.selected {
  border-color: #4caf50;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background: #eef6ea;
  transform: scale(1);
  transition: transform 0.2s ease;
}

.avatar:active {
  transform: scale(0.95);
}

.name,
.rating,
.experience {
  display: block;
  margin-top: 4px;
}

.name {
  font-size: 13px;
  font-weight: 700;
  color: #2d3a2d;
}

.rating,
.experience {
  color: #6b766b;
  font-size: 12px;
}

.detail-button {
  height: 26px;
  margin-top: 6px;
  padding: 0 8px;
  border: 0;
  border-radius: 999px;
  background: #eef6ea;
  color: #4caf50;
  font-size: 12px;
}
</style>
