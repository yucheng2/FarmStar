<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import TaskCard from '../../components/TaskCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import { getCareTakerInfo } from '../../services/authApi'
import { getCaretakerTasks, type TaskItem } from '../../services/caretakerApi'

const caretaker = getCareTakerInfo()
const tasks = ref<TaskItem[]>([])
const loading = ref(false)
const filter = ref<'all' | 'pending' | 'done'>('all')
const activeTab = ref<'home' | 'map' | 'scan' | 'profile'>('home')

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

const filteredTasks = () => {
  if (filter.value === 'all') return tasks.value
  if (filter.value === 'pending') return tasks.value.filter(t => t.urgency !== 'low')
  return tasks.value.filter(t => t.urgency === 'low')
}
</script>

<template>
  <view class="min-h-dvh bg-background pb-20">
    <!-- Header -->
    <view class="bg-primary text-primary-foreground px-4 py-6">
      <view class="flex items-center gap-3">
        <image
          v-if="caretaker?.avatarUrl"
          :src="caretaker.avatarUrl"
          class="w-12 h-12 rounded-full"
          :alt="caretaker.name"
        />
        <view>
          <view class="text-lg font-bold">{{ caretaker?.name }}</view>
          <view class="text-sm opacity-80">{{ caretaker?.village }}</view>
        </view>
      </view>
      <view class="mt-4 flex items-center gap-4">
        <view class="text-center">
          <view class="text-2xl font-bold">{{ tasks.length }}</view>
          <view class="text-xs opacity-80">负责田地</view>
        </view>
        <view class="text-center">
          <view class="text-2xl font-bold">{{ tasks.filter(t => t.urgency === 'high').length }}</view>
          <view class="text-xs opacity-80">紧急</view>
        </view>
        <view class="text-center">
          <view class="text-2xl font-bold">{{ tasks.filter(t => t.urgency === 'medium').length }}</view>
          <view class="text-xs opacity-80">待处理</view>
        </view>
      </view>
    </view>

    <!-- Filter -->
    <view class="px-4 py-3 flex gap-2">
      <button
        :class="filter === 'all' ? 'btn-primary' : 'btn-secondary'"
        class="px-4 py-2 text-sm"
        @click="filter = 'all'"
      >
        全部
      </button>
      <button
        :class="filter === 'pending' ? 'btn-primary' : 'btn-secondary'"
        class="px-4 py-2 text-sm"
        @click="filter = 'pending'"
      >
        待处理
      </button>
      <button
        :class="filter === 'done' ? 'btn-primary' : 'btn-secondary'"
        class="px-4 py-2 text-sm"
        @click="filter = 'done'"
      >
        已完成
      </button>
    </view>

    <!-- Task List -->
    <view class="px-4">
      <view v-if="loading" class="text-center py-8 text-muted-foreground">
        加载中...
      </view>
      <EmptyState
        v-else-if="filteredTasks().length === 0"
        title="暂无任务"
        description="今天没有需要养护的田地"
      />
      <TaskCard
        v-else
        v-for="task in filteredTasks()"
        :key="task.field.id"
        :task="task"
        @tap="handleTaskTap"
      />
    </view>

    <BottomNav :active="activeTab" @navigate="handleNav" />
  </view>
</template>
