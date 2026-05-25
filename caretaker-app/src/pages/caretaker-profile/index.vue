<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import { getCareTakerInfo, logout } from '../../services/authApi'
import { getCaretakerFields, getCaretakerTasks } from '../../services/caretakerApi'
import { uni } from '../../utils/uni-mock'

const caretaker = getCareTakerInfo()
const fieldCount = ref(0)
const taskCount = ref(0)
const loading = ref(false)
const activeTab = ref<'home' | 'map' | 'scan' | 'profile'>('profile')

onMounted(() => {
  void loadStats()
})

async function loadStats() {
  if (!caretaker) return
  loading.value = true
  try {
    const fields = await getCaretakerFields(caretaker.id)
    const tasks = await getCaretakerTasks(caretaker.id)
    fieldCount.value = fields.length
    taskCount.value = tasks.filter(t => t.urgency !== 'low').length
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
        uni.reLaunch({ url: '/pages/caretaker-login/index' })
      }
    }
  })
}

function handleNav(tab: 'home' | 'map' | 'scan' | 'profile') {
  activeTab.value = tab
  if (tab === 'home') {
    uni.switchTab({ url: '/pages/caretaker-home/index' })
  } else if (tab === 'map') {
    uni.switchTab({ url: '/pages/caretaker-map/index' })
  } else if (tab === 'scan') {
    uni.navigateTo({ url: '/pages/caretaker-scan/index' })
  }
}
</script>

<template>
  <view class="page-container">
    <!-- 头部信息 -->
    <view class="profile-header">
      <view class="user-info">
        <image
          v-if="caretaker?.avatarUrl"
          :src="caretaker.avatarUrl"
          class="avatar"
          :alt="caretaker.name"
        />
        <view v-else class="avatar avatar-placeholder">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="5"/>
            <path d="M20 21a8 8 0 0 0-16 0"/>
          </svg>
        </view>
        <view class="user-detail">
          <text class="user-name">{{ caretaker?.name }}</text>
          <text class="user-village">{{ caretaker?.village }}</text>
          <text class="user-phone">{{ caretaker?.phone }}</text>
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-num">{{ fieldCount }}</text>
        <text class="stat-label">负责田地</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ taskCount }}</text>
        <text class="stat-label">待处理任务</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">-</text>
        <text class="stat-label">累计养护</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view class="menu-item" @click="uni.navigateTo({ url: '/pages/caretaker-stats/index' })">
        <view class="menu-left">
          <text class="menu-icon">📊</text>
          <text class="menu-text">养护统计</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="uni.navigateTo({ url: '/pages/caretaker-settings/index' })">
        <view class="menu-left">
          <text class="menu-icon">⚙️</text>
          <text class="menu-text">设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item menu-item-last" @click="uni.navigateTo({ url: '/pages/caretaker-help/index' })">
        <view class="menu-left">
          <text class="menu-icon">❓</text>
          <text class="menu-text">帮助与反馈</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出按钮 -->
    <view class="logout-section">
      <button class="btn-logout" @click="handleLogout">
        退出登录
      </button>
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

/* 头部信息 */
.profile-header {
  display: flex;
  flex-direction: column;
  padding: 48px 20px 24px;
  background-color: var(--color-primary, #15803D);
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
}

.icon {
  width: 32px;
  height: 32px;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 22px;
  font-weight: 700;
}

.user-village {
  font-size: 14px;
  opacity: 0.85;
}

.user-phone {
  font-size: 14px;
  opacity: 0.85;
}

/* 统计卡片 */
.stats-card {
  display: flex;
  align-items: center;
  margin: -16px 16px 0;
  padding: 16px 8px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary, #15803D);
}

.stat-label {
  font-size: 12px;
  color: var(--color-muted-foreground, #6B766B);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: var(--color-border, #BBF7D0);
}

/* 菜单列表 */
.menu-section {
  display: flex;
  flex-direction: column;
  margin: 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border, #BBF7D0);
}

.menu-item-last {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  font-size: 18px;
}

.menu-text {
  font-size: 15px;
  color: var(--color-foreground, #14532D);
}

.menu-arrow {
  font-size: 18px;
  color: var(--color-muted-foreground, #6B766B);
}

/* 退出按钮 */
.logout-section {
  display: flex;
  padding: 16px;
  margin-top: auto;
}

.btn-logout {
  flex: 1;
  padding: 14px;
  background-color: white;
  color: #EF4444;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid #FECACA;
  border-radius: 12px;
  cursor: pointer;
}
</style>
