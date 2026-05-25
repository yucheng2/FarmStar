<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import FieldInfoCard from '../../components/FieldInfoCard.vue'
import { getCareTakerInfo } from '../../services/authApi'
import { getCaretakerFields } from '../../services/caretakerApi'
import type { Field } from '../../types/garden'
import { uni } from '../../utils/uni-mock'

const caretaker = getCareTakerInfo()
const fields = ref<Field[]>([])
const loading = ref(false)
const selectedField = ref<Field | null>(null)
const activeTab = ref<'home' | 'map' | 'scan' | 'profile'>('map')

onMounted(() => {
  void loadFields()
})

async function loadFields() {
  if (!caretaker) return
  loading.value = true
  try {
    fields.value = await getCaretakerFields(caretaker.id)
  } finally {
    loading.value = false
  }
}

function handleFieldTap(field: Field) {
  selectedField.value = field
}

function handleCloseDetail() {
  selectedField.value = null
}

function goToCareLog(field: Field) {
  uni.navigateTo({ url: `/pages/caretaker-care-log/index?field_id=${field.id}` })
}

function handleNav(tab: 'home' | 'map' | 'scan' | 'profile') {
  activeTab.value = tab
  if (tab === 'home') {
    uni.switchTab({ url: '/pages/caretaker-home/index' })
  } else if (tab === 'scan') {
    uni.navigateTo({ url: '/pages/caretaker-scan/index' })
  } else if (tab === 'profile') {
    uni.switchTab({ url: '/pages/caretaker-profile/index' })
  }
}

// 状态颜色映射
const statusColor: Record<string, string> = {
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444'
}
</script>

<template>
  <view class="page-container">
    <!-- 头部 -->
    <view class="header">
      <text class="title">田地地图</text>
      <text class="subtitle">{{ caretaker?.village }}</text>
    </view>

    <!-- 地图区域 -->
    <view class="map-area">
      <!-- 模拟地图背景 -->
      <view class="map-grid">
        <!-- 网格线 -->
        <view v-for="i in 5" :key="'h'+i" class="grid-line-h" :style="{ top: `${i * 20}%` }" />
        <view v-for="i in 5" :key="'v'+i" class="grid-line-v" :style="{ left: `${i * 20}%` }" />
      </view>

      <!-- 田地标记 -->
      <view class="markers-container">
        <view
          v-for="(field, index) in fields"
          :key="field.id"
          class="marker-item"
          :style="{
            left: `${20 + (index % 3) * 30}%`,
            top: `${25 + Math.floor(index / 3) * 35}%`
          }"
          @click="handleFieldTap(field)"
        >
          <view class="marker-dot" :style="{ backgroundColor: statusColor[field.status] || '#22C55E' }">
            <text class="marker-icon">🌱</text>
          </view>
          <view class="marker-label">
            <text>{{ field.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 田地列表 -->
    <view class="field-list">
      <view class="list-header">
        <text class="list-title">田地列表</text>
        <text class="list-count">{{ fields.length }}块</text>
      </view>
      <view class="list-items">
        <view
          v-for="field in fields"
          :key="field.id"
          class="field-card"
          @click="handleFieldTap(field)"
        >
          <view class="field-status" :style="{ backgroundColor: statusColor[field.status] || '#22C55E' }" />
          <view class="field-info">
            <text class="field-name">{{ field.name }}</text>
            <text class="field-area">{{ field.area }}亩</text>
          </view>
          <view class="field-arrow">
            <text>></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view v-if="selectedField" class="modal-overlay" @click="handleCloseDetail">
      <view class="detail-card" @click.stop>
        <view class="detail-header">
          <text class="detail-title">{{ selectedField.name }}</text>
          <text class="detail-close" @click="handleCloseDetail">×</text>
        </view>
        <FieldInfoCard :field="selectedField" />
        <view class="detail-action">
          <button class="btn-primary" @click="goToCareLog(selectedField)">
            开始养护
          </button>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <view class="spinner" />
      <text>加载中...</text>
    </view>

    <!-- 底部导航 -->
    <BottomNav :active="activeTab" @navigate="handleNav" />
  </view>
</template>

<style>
/* 页面容器 */
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: var(--color-background, #F0FDF4);
  padding-bottom: 80px;
}

/* 头部 */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 16px;
  background-color: var(--color-primary, #15803D);
  color: white;
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

/* 地图区域 */
.map-area {
  position: relative;
  height: 240px;
  background: linear-gradient(to bottom, #dcfce7, #bbf7d0);
  overflow: hidden;
}

.map-grid {
  position: absolute;
  inset: 0;
}

.grid-line-h {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #166534;
  opacity: 0.15;
}

.grid-line-v {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #166534;
  opacity: 0.15;
}

.markers-container {
  position: absolute;
  inset: 0;
}

.marker-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
}

.marker-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.marker-icon {
  font-size: 20px;
}

.marker-label {
  margin-top: 8px;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 田地列表 */
.field-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  flex: 1;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-foreground, #14532D);
}

.list-count {
  font-size: 14px;
  color: var(--color-muted-foreground, #6B766B);
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.field-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 12px;
}

.field-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}

.field-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-foreground, #14532D);
}

.field-area {
  font-size: 13px;
  color: var(--color-muted-foreground, #6B766B);
}

.field-arrow {
  font-size: 18px;
  color: var(--color-muted-foreground, #6B766B);
}

/* 详情弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.detail-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  padding: 20px;
  background-color: white;
  border-radius: 16px 16px 0 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-foreground, #14532D);
}

.detail-close {
  font-size: 28px;
  color: var(--color-muted-foreground, #6B766B);
  line-height: 1;
}

.detail-action {
  margin-top: 16px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background-color: var(--color-primary, #15803D);
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

/* 加载状态 */
.loading {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 200;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--color-border, #BBF7D0);
  border-top-color: var(--color-primary, #15803D);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
