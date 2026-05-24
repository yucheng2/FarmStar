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
  <view
    v-if="open && caretaker"
    style="position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0, 0, 0, 0.4);"
    data-test="caretaker-modal"
  >
    <view class="card" style="width: 85%; max-width: 360px; display: flex; flex-direction: column; gap: 12px;">
      <!-- Photos -->
      <view style="display: flex; gap: 10px;">
        <image
          style="width: 50%; height: 120px; border-radius: 10px; background: rgb(21 128 61 / 0.1); object-fit: cover;"
          :src="caretaker.realPhotoUrl"
          :alt="`${caretaker.name}真人照片`"
        />
        <image
          style="width: 50%; height: 120px; border-radius: 10px; background: rgb(21 128 61 / 0.1); object-fit: cover;"
          :src="caretaker.avatarUrl"
          :alt="`${caretaker.name}二次元形象`"
        />
      </view>

      <!-- Info -->
      <view style="display: flex; flex-direction: column; gap: 6px;">
        <view style="color: var(--color-foreground); font-size: 15px; font-weight: 700;">
          {{ caretaker.name }} · {{ caretaker.age }}岁 · {{ caretaker.village }}
        </view>
        <view style="color: var(--color-muted-foreground); font-size: 13px;">
          {{ caretaker.experienceYears }}年管护经验
        </view>
        <view style="color: var(--color-muted-foreground); font-size: 13px;">
          擅长：{{ caretaker.specialties.join(' / ') }}
        </view>
        <view style="color: var(--color-primary); font-size: 14px; font-weight: 700;">
          {{ caretaker.rating.toFixed(1) }} ★ · {{ caretaker.reviewCount }}条评价
        </view>
        <view style="color: var(--color-muted-foreground); font-size: 13px;">
          近30天完成：{{ caretaker.completedAdoptionsLast30Days }}
        </view>
        <view style="color: var(--color-muted-foreground); font-size: 13px;">
          好评率：{{ caretaker.positiveRate }}%
        </view>
      </view>

      <!-- Buttons -->
      <view style="display: flex; gap: 8px; margin-top: 4px;">
        <button
          data-test="responsible-fields"
          class="btn-primary"
          style="flex: 1; height: 36px; padding: 0 8px; font-size: 12px; white-space: nowrap; display: flex; align-items: center; justify-content: center;"
          @click="showResponsibleFields"
        >
          负责的田地
        </button>
        <button
          data-test="contact-caretaker"
          class="btn-primary"
          style="flex: 1; height: 36px; padding: 0 8px; font-size: 12px; white-space: nowrap; display: flex; align-items: center; justify-content: center;"
          @click="contactCaretaker"
        >
          联系管护员
        </button>
        <button
          data-test="close-modal"
          class="btn-secondary"
          style="flex: 1; height: 36px; padding: 0 8px; font-size: 12px; white-space: nowrap; display: flex; align-items: center; justify-content: center;"
          @click="close"
        >
          关闭
        </button>
      </view>
    </view>
  </view>
</template>
