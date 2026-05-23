<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAdoptionById, getCaretakerById, getFieldById } from '../../services/gardenApi'
import type { Adoption, Caretaker, Field } from '../../types/garden'

const props = defineProps<{
  adoptionId?: string
  adoption_id?: string
}>()

const adoption = ref<Adoption | null>(null)
const field = ref<Field | null>(null)
const caretaker = ref<Caretaker | null>(null)
const loading = ref(false)
const notFound = ref(false)
const error = ref('')

const resolvedAdoptionId = computed(() => props.adoptionId ?? props.adoption_id ?? '')

const statusText = computed(() => {
  if (!adoption.value) return ''
  if (adoption.value.status === 'pending_payment') return '申请已提交'
  if (adoption.value.status === 'active') return '认养中'
  if (adoption.value.status === 'completed') return '已完成'
  return '已取消'
})

async function loadDetail() {
  loading.value = true
  notFound.value = false
  error.value = ''

  if (!resolvedAdoptionId.value) {
    notFound.value = true
    loading.value = false
    return
  }

  try {
    const adoptionRecord = await getAdoptionById(resolvedAdoptionId.value)
    adoption.value = adoptionRecord
    const [fieldRecord, caretakerRecord] = await Promise.all([
      getFieldById(adoptionRecord.fieldId),
      getCaretakerById(adoptionRecord.caretakerId)
    ])
    field.value = fieldRecord
    caretaker.value = caretakerRecord
  } catch (caughtError) {
    if (!adoption.value) {
      notFound.value = true
    } else {
      error.value = caughtError instanceof Error ? caughtError.message : '认养记录加载失败，请返回田园重试'
    }
  } finally {
    loading.value = false
  }
}

function returnToGarden() {
  uni.navigateTo({ url: '/pages/garden/index' })
}

onMounted(() => {
  void loadDetail()
})
</script>

<template>
  <view class="page">
    <view class="card" v-if="loading">
      <text class="title">加载中...</text>
    </view>

    <view class="card" v-else-if="notFound">
      <text class="title">未找到认养记录</text>
      <text>请返回田园重新选择田地和管护员。</text>
      <button data-test="return-garden" @click="returnToGarden">返回田园</button>
    </view>

    <view class="card" v-else-if="error">
      <text class="title">认养记录加载失败</text>
      <text>{{ error }}</text>
      <button data-test="return-garden" @click="returnToGarden">返回田园</button>
    </view>

    <view class="detail" v-else-if="adoption && field && caretaker">
      <view class="hero card">
        <text class="eyebrow">认养详情</text>
        <text class="title">{{ statusText }}</text>
        <text>认养编号：{{ adoption.id }}</text>
        <text>创建时间：{{ adoption.createdAt }}</text>
        <text>测试支付单号：{{ adoption.paymentOrderId }}</text>
      </view>

      <view class="card">
        <text class="section-title">田地信息</text>
        <text>{{ field.name }} · {{ field.code }}</text>
        <text>面积：{{ field.areaSquareMeters }}㎡</text>
        <text v-if="field.crop">作物：{{ field.crop.name }} · 生长进度 {{ field.crop.progressPercent }}%</text>
        <text v-if="field.expectedHarvestDate">预计收获：{{ field.expectedHarvestDate }}</text>
        <view v-if="field.crop" class="progress-track">
          <view class="progress-fill" :style="{ width: `${field.crop.progressPercent}%` }" />
        </view>
      </view>

      <view class="card">
        <text class="section-title">管护员信息</text>
        <text>{{ caretaker.name }} · {{ caretaker.rating.toFixed(1) }} ★</text>
        <text>{{ caretaker.experienceYears }}年管护经验</text>
        <text>{{ caretaker.village }}</text>
      </view>

      <button data-test="return-garden" @click="returnToGarden">返回田园</button>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 16px;
  background: #f6fbf3;
  box-sizing: border-box;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 16px;
  background: #ffffff;
  color: #2d3a2d;
  box-sizing: border-box;
}

.hero {
  background: linear-gradient(135deg, #e9f8df, #ffffff);
}

.eyebrow {
  color: #4caf50;
  font-size: 13px;
  font-weight: 700;
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
}

.progress-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6eee3;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
}

button {
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}
</style>
