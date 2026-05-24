<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import { getCareTakerInfo, logout } from '../../services/authApi'
import { getCaretakerFields, getCaretakerTasks } from '../../services/caretakerApi'

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
  <view class="min-h-dvh bg-background pb-20">
    <!-- Profile Header -->
    <view class="bg-primary text-primary-foreground p-6">
      <view class="flex items-center gap-4">
        <image
          v-if="caretaker?.avatarUrl"
          :src="caretaker.avatarUrl"
          class="w-20 h-20 rounded-full border-4 border-white/30"
          :alt="caretaker.name"
        />
        <view>
          <view class="text-2xl font-bold">{{ caretaker?.name }}</view>
          <view class="text-sm opacity-80">{{ caretaker?.village }}</view>
          <view class="text-sm opacity-80 mt-1">{{ caretaker?.phone }}</view>
        </view>
      </view>
    </view>

    <!-- Stats -->
    <view class="px-4 -mt-4">
      <view class="card flex justify-around py-4">
        <view class="text-center">
          <view class="text-2xl font-bold text-primary">{{ fieldCount }}</view>
          <view class="text-xs text-muted-foreground mt-1">负责田地</view>
        </view>
        <view class="text-center">
          <view class="text-2xl font-bold text-primary">{{ taskCount }}</view>
          <view class="text-xs text-muted-foreground mt-1">待处理任务</view>
        </view>
        <view class="text-center">
          <view class="text-2xl font-bold text-primary">-</view>
          <view class="text-xs text-muted-foreground mt-1">累计养护</view>
        </view>
      </view>
    </view>

    <!-- Menu -->
    <view class="p-4">
      <view class="card">
        <button class="w-full flex items-center justify-between py-3 border-b border-border">
          <view class="flex items-center gap-3">
            <text class="text-xl">📊</text>
            <text class="text-foreground">养护统计</text>
          </view>
          <text class="text-muted-foreground">›</text>
        </button>
        <button class="w-full flex items-center justify-between py-3 border-b border-border">
          <view class="flex items-center gap-3">
            <text class="text-xl">⚙️</text>
            <text class="text-foreground">设置</text>
          </view>
          <text class="text-muted-foreground">›</text>
        </button>
        <button class="w-full flex items-center justify-between py-3">
          <view class="flex items-center gap-3">
            <text class="text-xl">❓</text>
            <text class="text-foreground">帮助与反馈</text>
          </view>
          <text class="text-muted-foreground">›</text>
        </button>
      </view>
    </view>

    <!-- Logout -->
    <view class="p-4">
      <button
        class="btn-secondary w-full h-12 text-red-500 border-red-200"
        @click="handleLogout"
      >
        退出登录
      </button>
    </view>

    <BottomNav :active="activeTab" @navigate="handleNav" />
  </view>
</template>
