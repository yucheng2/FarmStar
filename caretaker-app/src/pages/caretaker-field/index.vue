<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FieldInfoCard from '../../components/FieldInfoCard.vue'
import CareLogItem from '../../components/CareLogItem.vue'
import type { Field, CareLog } from '../../types/garden'

const fieldId = ref('')
const field = ref<Field | null>(null)
const logs = ref<CareLog[]>([])
const loading = ref(false)

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
    const { getFieldDetail } = await import('../../services/caretakerApi')
    const result = await getFieldDetail(fieldId.value)
    field.value = result.field
    logs.value = result.logs
  } finally {
    loading.value = false
  }
}

function goToCareLog() {
  uni.navigateTo({ url: `/pages/caretaker-care-log/index?field_id=${fieldId.value}` })
}

function goToMonitoring() {
  uni.navigateTo({ url: `/pages/field-monitoring/index?field_id=${fieldId.value}` })
}
</script>

<template>
  <view class="min-h-dvh bg-background pb-6">
    <view v-if="loading" class="text-center py-8 text-muted-foreground">加载中...</view>

    <template v-else-if="field">
      <FieldInfoCard :field="field" class="m-4" />

      <!-- Actions -->
      <view class="px-4 flex gap-2">
        <button class="btn-primary flex-1" @click="goToCareLog">
          开始养护
        </button>
        <button class="btn-secondary flex-1" @click="goToMonitoring">
          查看监控
        </button>
      </view>

      <!-- Care Logs -->
      <view class="m-4">
        <view class="font-bold text-foreground mb-3">养护记录</view>
        <view class="card">
          <view v-if="logs.length === 0" class="text-center py-4 text-muted-foreground">
            暂无养护记录
          </view>
          <CareLogItem v-for="log in logs" :key="log.id" :log="log" />
        </view>
      </view>
    </template>
  </view>
</template>
