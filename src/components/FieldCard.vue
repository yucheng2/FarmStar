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
  <view class="field-card" data-test="field-card">
    <view class="field-main">
      <view class="field-header">
        <text class="field-name">{{ field.name }}</text>
        <image
          v-if="field.caretaker"
          class="caretaker-avatar"
          data-test="caretaker-avatar"
          :src="field.caretaker.avatarUrl"
          :alt="field.caretaker.name"
          @click.stop="emitCaretaker"
        />
      </view>

      <view class="field-meta">
        <text>面积：{{ field.areaSquareMeters }}㎡</text>
        <text class="status" :class="`status-${field.status}`">{{ statusText[field.status] }}</text>
      </view>

      <view v-if="field.crop" class="crop-row">
        <image class="crop-icon" :src="field.crop.iconUrl" :alt="field.crop.name" />
        <text>{{ field.crop.name }}</text>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: `${field.crop.progressPercent}%` }" />
        </view>
        <text>{{ field.crop.progressPercent }}%</text>
      </view>
      <view v-else class="crop-row">
        <text>可种植：蔬菜/水果</text>
      </view>

      <view class="field-footer">
        <text class="harvest">预计收获：{{ field.expectedHarvestDate ?? '--' }}</text>
        <button class="action-button" data-test="field-action" :disabled="field.status === 'maintenance'" @click.stop="emitAction">
          {{ actionText }}
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.field-card {
  min-height: 180px;
  margin: 16px;
  padding: 16px;
  border: 1px solid #dde8d8;
  border-radius: 16px;
  background: #ffffff;
  box-sizing: border-box;
}

.field-header,
.field-meta,
.crop-row,
.field-footer {
  display: flex;
  align-items: center;
}

.field-header,
.field-footer {
  justify-content: space-between;
}

.field-name {
  font-size: 16px;
  font-weight: 700;
  color: #2d3a2d;
}

.caretaker-avatar {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #eef6ea;
  transform: scale(1);
  transition: transform 0.2s ease;
}

.caretaker-avatar:active {
  transform: scale(0.95);
}

.field-meta {
  gap: 12px;
  margin-top: 8px;
  color: #6b766b;
  font-size: 12px;
}

.status {
  padding: 3px 8px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 12px;
}

.status-idle { background: #4caf50; }
.status-adopted { background: #2196f3; }
.status-ready_to_harvest { background: #ffc107; color: #2d3a2d; }
.status-maintenance { background: #9e9e9e; }

.crop-row {
  gap: 8px;
  margin-top: 14px;
  color: #2d3a2d;
  font-size: 13px;
}

.crop-icon {
  width: 24px;
  height: 24px;
}

.progress-track {
  width: 90px;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6eee3;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
}

.field-footer {
  margin-top: 18px;
}

.harvest {
  color: #6b766b;
  font-size: 12px;
}

.action-button {
  min-width: 88px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 13px;
}

.action-button[disabled] {
  background: #b7c5b1;
}
</style>
