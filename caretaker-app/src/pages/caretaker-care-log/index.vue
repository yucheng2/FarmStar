<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CareLogItem from '../../components/CareLogItem.vue'
import EmptyState from '../../components/EmptyState.vue'
import type { Field, CareLog } from '../../types/garden'
import { getCareTakerInfo } from '../../services/authApi'
import { getFieldDetail, createCareLog } from '../../services/caretakerApi'
import { uni } from '../../utils/uni-mock'

const fieldId = ref('')
const field = ref<Field | null>(null)
const logs = ref<CareLog[]>([])
const loading = ref(false)
const submitting = ref(false)

const actionTypes = [
  { key: '浇水', icon: '💧', label: '浇水' },
  { key: '除草', icon: '🌿', label: '除草' },
  { key: '施肥', icon: '🌱', label: '施肥' },
  { key: '巡检', icon: '👁️', label: '巡检' },
  { key: '收获', icon: '🌾', label: '收获' },
  { key: '其他', icon: '📝', label: '其他' }
]

const selectedAction = ref('')
const note = ref('')

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

async function handleSubmit() {
  if (!selectedAction.value) {
    uni.showToast({ title: '请选择养护动作', icon: 'none' })
    return
  }

  const caretaker = getCareTakerInfo()
  if (!caretaker) {
    uni.showToast({ title: '未登录', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const newLog = await createCareLog(fieldId.value, caretaker.id, selectedAction.value, note.value)
    logs.value = [newLog, ...logs.value]
    selectedAction.value = ''
    note.value = ''
    uni.showToast({ title: '记录成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">养护记录</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <template v-else-if="field">
      <!-- 田地信息 -->
      <view class="field-info">
        <text class="field-name">{{ field.name }}</text>
        <text class="field-meta">{{ field.code }} · {{ field.areaSquareMeters }}㎡</text>
      </view>

      <!-- 养护动作选择 -->
      <view class="section">
        <text class="section-title">选择养护动作</text>
        <view class="action-grid">
          <view
            v-for="action in actionTypes"
            :key="action.key"
            :class="['action-item', selectedAction === action.key ? 'action-item-active' : '']"
            @click="selectedAction = action.key"
          >
            <text class="action-icon">{{ action.icon }}</text>
            <text :class="['action-label', selectedAction === action.key ? 'action-label-active' : '']">
              {{ action.label }}
            </text>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="section">
        <text class="section-title">备注（可选）</text>
        <textarea
          v-model="note"
          class="note-input"
          placeholder="添加备注..."
          maxlength="200"
        />
      </view>

      <!-- 提交按钮 -->
      <view class="section">
        <button class="btn-primary" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : '提交记录' }}
        </button>
      </view>

      <!-- 最近记录 -->
      <view class="section">
        <text class="section-title">最近记录</text>
        <view class="log-list">
          <EmptyState
            v-if="logs.length === 0"
            title="暂无记录"
            description="开始你的第一次养护记录吧"
          />
          <CareLogItem v-for="log in logs.slice(0, 5)" :key="log.id" :log="log" />
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

/* 田地信息 */
.field-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background-color: rgba(21, 128, 61, 0.1);
}

.field-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-foreground, #14532D);
}

.field-meta {
  font-size: 13px;
  color: var(--color-muted-foreground, #6B766B);
}

/* 区块 */
.section {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-foreground, #14532D);
  margin-bottom: 12px;
}

/* 动作网格 */
.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(33.33% - 6px);
  padding: 12px 8px;
  background-color: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
}

.action-item-active {
  border-color: var(--color-primary, #15803D);
  background-color: rgba(21, 128, 61, 0.05);
}

.action-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.action-label {
  font-size: 12px;
  color: #6B7280;
}

.action-label-active {
  color: var(--color-primary, #15803D);
  font-weight: 600;
}

/* 备注输入 */
.note-input {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  background-color: white;
  border: 1px solid var(--color-border, #BBF7D0);
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-foreground, #14532D);
  box-sizing: border-box;
  resize: vertical;
}

.note-input:focus {
  outline: none;
  border-color: var(--color-primary, #15803D);
}

.note-input::placeholder {
  color: var(--color-muted-foreground, #6B766B);
}

/* 提交按钮 */
.btn-primary {
  width: 100%;
  padding: 14px;
  background-color: var(--color-primary, #15803D);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
}

/* 记录列表 */
.log-list {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  padding: 8px 0;
}
</style>
