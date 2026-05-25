<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import TaskCard from '../../components/TaskCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import { getCareTakerInfo } from '../../services/authApi'
import { getCaretakerTasks, type TaskItem } from '../../services/caretakerApi'
import { uni } from '../../utils/uni-mock'

const caretaker = getCareTakerInfo()
const tasks = ref<TaskItem[]>([])
const loading = ref(false)
const filter = ref<'all' | 'pending' | 'done'>('all')
const activeTab = ref<'home' | 'map' | 'scan' | 'profile'>('home')

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const todayStr = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

onMounted(() => {
  void loadTasks()
})

async function loadTasks() {
  if (!caretaker) return
  loading.value = true
  try {
    tasks.value = await getCaretakerTasks(caretaker.id)
  } finally {
    loading.value = false
  }
}

function handleTaskTap(task: TaskItem) {
  uni.navigateTo({ url: `/pages/caretaker-field/index?field_id=${task.field.id}` })
}

function handleNav(tab: 'home' | 'map' | 'scan' | 'profile') {
  activeTab.value = tab
  if (tab === 'map') {
    uni.switchTab({ url: '/pages/caretaker-map/index' })
  } else if (tab === 'scan') {
    uni.navigateTo({ url: '/pages/caretaker-scan/index' })
  } else if (tab === 'profile') {
    uni.switchTab({ url: '/pages/caretaker-profile/index' })
  }
}

const filteredTasks = computed(() => {
  if (filter.value === 'all') return tasks.value
  if (filter.value === 'pending') return tasks.value.filter(t => t.urgency !== 'low')
  return tasks.value.filter(t => t.urgency === 'low')
})

const highPriorityCount = computed(() => tasks.value.filter(t => t.urgency === 'high').length)
const pendingCount = computed(() => tasks.value.filter(t => t.urgency === 'medium').length)
</script>

<template>
  <view class="page-container">
    <!-- 头部 -->
    <view class="home-header">
      <!-- 品牌栏 -->
      <view class="h-brand-row">
        <span class="brand">🌱 FarmStar</span>
        <span class="h-date">{{ todayStr }}</span>
      </view>
      <!-- 用户信息行 -->
      <view class="h-user-row">
        <view class="h-user-info">
          <span class="h-greeting">{{ greeting }}，{{ caretaker?.name || '养护员' }}</span>
          <span class="h-location">📍 {{ caretaker?.village || '加载中' }}</span>
        </view>
        <view class="h-avatar">
          <img
            v-if="caretaker?.avatarUrl"
            :src="caretaker.avatarUrl"
            class="avatar-img"
            :alt="caretaker.name"
          />
          <span v-else class="avatar-placeholder">🌾</span>
        </view>
      </view>
    </view>

    <!-- 统计卡片（独立区域，白底） -->
    <view class="stats-row">
      <view class="s-card">
        <span class="s-num s-num-field">{{ tasks.length }}</span>
        <span class="s-lab">田地</span>
      </view>
      <view class="s-card">
        <span class="s-num s-num-urgent">{{ highPriorityCount }}</span>
        <span class="s-lab">紧急</span>
      </view>
      <view class="s-card">
        <span class="s-num s-num-pending">{{ pendingCount }}</span>
        <span class="s-lab">待办</span>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="item in [
          { key: 'all', label: '全部' },
          { key: 'pending', label: '待处理' },
          { key: 'done', label: '已完成' }
        ]"
        :key="item.key"
        :class="['filter-tab', filter === item.key ? 'filter-tab-on' : '']"
        @click="filter = item.key as any"
      >
        <span>{{ item.label }}</span>
      </view>
    </view>

    <!-- 任务列表 -->
    <view class="task-area">
      <view v-if="loading" class="loading-box">
        <view class="loading-spin" />
        <span>加载中...</span>
      </view>
      <EmptyState
        v-else-if="filteredTasks.length === 0"
        title="暂无任务"
        description="今天没有需要养护的田地"
      />
      <view v-else class="task-stack">
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.field.id"
          :task="task"
          @tap="handleTaskTap"
        />
      </view>
    </view>

    <!-- 底部导航 -->
    <BottomNav :active="activeTab" @navigate="handleNav" />
  </view>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #F0FDF4;
  padding-bottom: 80px;
}

.home-header {
  background: linear-gradient(150deg, #16a34a 0%, #15803D 60%, #166534 100%);
  padding: 16px 16px 20px;
  color: white;
}

.h-brand-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.brand {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.h-date {
  font-size: 12px;
  opacity: 0.7;
}

.h-user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h-user-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.h-greeting {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.h-location {
  font-size: 13px;
  opacity: 0.8;
}

.h-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.15);
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 24px;
}

/* 统计行：白底卡片，紧贴 header 下方 */
.stats-row {
  display: flex;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 0 16px;
}

.s-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 14px 0;
}

.s-card + .s-card {
  border-left: 1px solid #F3F4F6;
}

.s-num {
  font-size: 22px;
  font-weight: 700;
}

.s-num-field { color: #15803D; }
.s-num-urgent { color: #DC2626; }
.s-num-pending { color: #D97706; }

.s-lab {
  font-size: 11px;
  color: #9CA3AF;
}

.filter-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
}

.filter-tab {
  padding: 5px 14px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  background-color: white;
  color: #15803D;
  border: 1px solid #BBF7D0;
}

.filter-tab-on {
  background-color: #15803D;
  color: white;
}

.task-area {
  flex: 1;
  padding: 0 16px;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  color: #6B766B;
  font-size: 14px;
}

.loading-spin {
  width: 28px;
  height: 28px;
  border: 2px solid #BBF7D0;
  border-top-color: #15803D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.task-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
