<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FieldInfoCard from '../../components/FieldInfoCard.vue'
import CareLogItem from '../../components/CareLogItem.vue'
import type { Field, CareLog } from '../../types/garden'
import { uni } from '../../utils/uni-mock'

const fieldId = ref('')
const field = ref<Field | null>(null)
const logs = ref<CareLog[]>([])
const loading = ref(false)

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  fieldId.value = params.get('field_id') || ''
  if (fieldId.value) {
    void loadField()
  }
})

async function loadField() {
  loading.value = true
  try {
    const { getFieldDetail } = await import('../../services/caretakerApi')
    const result = await getFieldDetail(fieldId.value)
    field.value = result.field
    logs.value = result.logs
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function goToCareLog() {
  uni.navigateTo({ url: `/pages/caretaker-care-log/index?field_id=${fieldId.value}` })
}

function goToMonitoring() {
  uni.showToast({ title: '监控功能暂未开放', icon: 'none' })
}
</script>

<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">田地详情</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 田地信息 -->
    <template v-else-if="field">
      <!-- 田地卡片 -->
      <view class="section">
        <FieldInfoCard :field="field" />
      </view>

      <!-- 操作按钮 -->
      <view class="action-row">
        <button class="btn-primary" @click="goToCareLog">
          开始养护
        </button>
        <button class="btn-secondary" @click="goToMonitoring">
          查看监控
        </button>
      </view>

      <!-- 养护记录 -->
      <view class="section">
        <view class="section-title">养护记录</view>
        <view class="log-list">
          <view v-if="logs.length === 0" class="empty">
            <text>暂无养护记录</text>
          </view>
          <CareLogItem v-for="log in logs" :key="log.id" :log="log" />
        </view>
      </view>
    </template>
  </view>
</template>

<style>
/* 页面容器 */
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: var(--color-background, #F0FDF4);
}

/* 顶部导航 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 16px 16px;
  background-color: var(--color-primary, #15803D);
  color: white;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.back-icon {
  font-size: 24px;
  font-weight: 600;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
}

.nav-placeholder {
  width: 40px;
}

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: var(--color-muted-foreground, #6B766B);
  font-size: 14px;
}

/* 区块 */
.section {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-foreground, #14532D);
  margin-bottom: 12px;
}

/* 操作按钮 */
.action-row {
  display: flex;
  gap: 12px;
  padding: 0 16px 16px;
}

.btn-primary {
  flex: 1;
  padding: 14px;
  background-color: var(--color-primary, #15803D);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.btn-secondary {
  flex: 1;
  padding: 14px;
  background-color: white;
  color: var(--color-primary, #15803D);
  font-size: 15px;
  font-weight: 600;
  border: 1px solid var(--color-border, #BBF7D0);
  border-radius: 12px;
  cursor: pointer;
}

/* 记录列表 */
.log-list {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  padding: 8px 0;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: var(--color-muted-foreground, #6B766B);
  font-size: 14px;
}
</style>
