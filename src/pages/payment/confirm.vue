<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAdoptionById } from '../../services/gardenApi'
import type { Adoption } from '../../types/garden'

const props = defineProps<{
  adoptionId?: string
  adoption_id?: string
}>()

const adoption = ref<Adoption | undefined>()
const loading = ref(false)
const submitted = ref(false)

const resolvedAdoptionId = computed(() => props.adoptionId ?? props.adoption_id ?? 'adoption-field-001-caretaker-zhang')

async function loadAdoption() {
  loading.value = true

  try {
    adoption.value = await getAdoptionById(resolvedAdoptionId.value)
  } catch {
    adoption.value = undefined
  } finally {
    loading.value = false
  }
}

function skipPayment() {
  submitted.value = true
  uni.showToast({ title: '认养申请已提交', icon: 'none' })
}

function viewAdoptionDetail() {
  if (!adoption.value) return
  uni.navigateTo({ url: `/pages/adoption/detail?adoption_id=${adoption.value.id}` })
}

function returnToGarden() {
  uni.navigateTo({ url: '/pages/garden/index' })
}

onMounted(() => {
  void loadAdoption()
})
</script>

<template>
  <view class="page">
    <view class="card" v-if="loading">
      <text class="title">加载中...</text>
    </view>
    <view class="card" v-else-if="adoption && submitted">
      <text class="success-mark">✓</text>
      <text class="title">认养申请已提交</text>
      <text>认养编号：{{ adoption.id }}</text>
      <text>我们已收到你的认养申请，管护员会继续为你照看田地。</text>
      <button data-test="view-adoption-detail" @click="viewAdoptionDetail">查看认养详情</button>
      <button data-test="return-garden" class="secondary-button" @click="returnToGarden">返回田园</button>
    </view>
    <view class="card" v-else-if="adoption">
      <text class="title">确认认养</text>
      <text>认养编号：{{ adoption.id }}</text>
      <text>田地编号：{{ adoption.fieldId }}</text>
      <text>管护员编号：{{ adoption.caretakerId }}</text>
      <text>支付单号：{{ adoption.paymentOrderId }}</text>
      <button data-test="pay-button" @click="skipPayment">提交认养申请</button>
    </view>
    <view class="card" v-else>
      <text class="title">未找到认养记录</text>
      <text>请返回田园重新选择田地和管护员。</text>
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

.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 16px;
  background: #ffffff;
  color: #2d3a2d;
}

.title {
  font-size: 18px;
  font-weight: 700;
}

.success-mark {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #4caf50;
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  line-height: 48px;
  text-align: center;
}

button {
  height: 44px;
  margin-top: 12px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.secondary-button {
  margin-top: 0;
  background: #eef6ea;
  color: #4caf50;
}
</style>
