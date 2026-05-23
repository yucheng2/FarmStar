<script setup lang="ts">
import type { Caretaker } from '../types/garden'

const props = defineProps<{
  open: boolean
  caretaker: Caretaker | null
}>()

const emit = defineEmits<{
  close: []
  responsibleFields: [caretaker: Caretaker]
  contact: [caretaker: Caretaker]
}>()

function close() {
  emit('close')
}

function showResponsibleFields() {
  if (props.caretaker) emit('responsibleFields', props.caretaker)
}

function contactCaretaker() {
  if (props.caretaker) emit('contact', props.caretaker)
}
</script>

<template>
  <view v-if="open && caretaker" class="modal-mask" data-test="caretaker-modal">
    <view class="modal-panel">
      <view class="photo-row">
        <image class="photo" :src="caretaker.realPhotoUrl" :alt="`${caretaker.name}真人照片`" />
        <image class="photo" :src="caretaker.avatarUrl" :alt="`${caretaker.name}二次元形象`" />
      </view>

      <view class="info-block">
        <text class="name">{{ caretaker.name }} · {{ caretaker.age }}岁 · {{ caretaker.village }}</text>
        <text class="muted">{{ caretaker.experienceYears }}年管护经验</text>
        <text class="muted">擅长：{{ caretaker.specialties.join(' / ') }}</text>
        <text class="score">{{ caretaker.rating.toFixed(1) }} ★ · {{ caretaker.reviewCount }}条评价</text>
        <text class="muted">近30天完成：{{ caretaker.completedAdoptionsLast30Days }}</text>
        <text class="muted">好评率：{{ caretaker.positiveRate }}%</text>
      </view>

      <view class="button-row">
        <button data-test="responsible-fields" @click="showResponsibleFields">负责的田地</button>
        <button data-test="contact-caretaker" @click="contactCaretaker">联系管护员</button>
        <button data-test="close-modal" @click="close">关闭</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.36);
}

.modal-panel {
  width: 80%;
  max-width: 360px;
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
  box-sizing: border-box;
}

.photo-row {
  display: flex;
  gap: 12px;
}

.photo {
  width: 50%;
  height: 120px;
  border-radius: 10px;
  background: #eef6ea;
  object-fit: cover;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 14px;
}

.name {
  color: #2d3a2d;
  font-size: 14px;
  font-weight: 700;
}

.score {
  color: #4caf50;
  font-size: 14px;
  font-weight: 700;
}

.muted {
  color: #6b766b;
  font-size: 12px;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.button-row button {
  flex: 1;
  min-width: 88px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 12px;
}
</style>
