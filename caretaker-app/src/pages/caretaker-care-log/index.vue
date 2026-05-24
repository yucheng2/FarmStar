<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CareLogItem from '../../components/CareLogItem.vue'
import EmptyState from '../../components/EmptyState.vue'
import type { Field, CareLog } from '../../types/garden'
import { getCareTakerInfo } from '../../services/authApi'
import { getFieldDetail, createCareLog } from '../../services/caretakerApi'

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
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  const options = (current as any)?.options || {}
  fieldId.value = options.field_id || ''
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
  <view class="min-h-dvh bg-background pb-6">
    <view v-if="loading" class="text-center py-8 text-muted-foreground">加载中...</view>

    <template v-else-if="field">
      <!-- Field Info -->
      <view class="bg-primary/10 p-4">
        <view class="font-bold text-foreground">{{ field.name }}</view>
        <view class="text-sm text-muted-foreground">{{ field.code }} · {{ field.areaSquareMeters }}㎡</view>
      </view>

      <!-- Action Selection -->
      <view class="p-4">
        <view class="font-bold text-foreground mb-3">选择养护动作</view>
        <view class="grid grid-cols-3 gap-3">
          <button
            v-for="action in actionTypes"
            :key="action.key"
            class="card flex flex-col items-center py-4 gap-2"
            :class="selectedAction === action.key ? 'border-2 border-primary bg-primary/5' : ''"
            @click="selectedAction = action.key"
          >
            <text class="text-2xl">{{ action.icon }}</text>
            <text class="text-sm" :class="selectedAction === action.key ? 'text-primary font-bold' : 'text-foreground'">
              {{ action.label }}
            </text>
          </button>
        </view>
      </view>

      <!-- Note -->
      <view class="px-4">
        <view class="font-bold text-foreground mb-3">备注（可选）</view>
        <textarea
          v-model="note"
          class="input-field w-full h-24 p-3"
          placeholder="添加备注..."
          maxlength="200"
        />
      </view>

      <!-- Submit -->
      <view class="px-4 mt-4">
        <button
          class="btn-primary w-full h-12"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? '提交中...' : '提交记录' }}
        </button>
      </view>

      <!-- Recent Logs -->
      <view class="p-4">
        <view class="font-bold text-foreground mb-3">最近记录</view>
        <view class="card">
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
