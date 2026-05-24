<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAdoptionById, getCaretakerById, getFieldById } from '../../services/gardenApi'
import { trackEvent } from '../../services/analytics'
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

const statusColor = computed(() => {
  if (!adoption.value) return ''
  if (adoption.value.status === 'pending_payment') return 'bg-amber-50 text-amber-700'
  if (adoption.value.status === 'active') return 'bg-primary/10 text-primary'
  if (adoption.value.status === 'completed') return 'bg-slate-100 text-slate-600'
  return 'bg-red-50 text-red-600'
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

function returnToAdoptions() {
  uni.navigateTo({ url: '/pages/adoption/index' })
}

function goToPayment() {
  if (!adoption.value) return
  uni.showToast({ title: '跳转支付...', icon: 'none', duration: 800 })
  setTimeout(() => {
    uni.navigateTo({ url: `/pages/payment/confirm?order_id=${adoption.value!.paymentOrderId}` })
  }, 300)
}

function viewFieldMonitoring() {
  if (!field.value) return
  uni.navigateTo({ url: `/pages/field-monitoring/index?field_id=${field.value.id}` })
}

onMounted(() => {
  trackEvent({ event: 'page_view', userId: 'user-demo', pageName: 'adoption_detail' })
  void loadDetail()
})
</script>

<template>
  <view class="min-h-dvh bg-background pb-6">
    <!-- Loading -->
    <view v-if="loading" style="margin: 40px 16px; text-align: center; color: var(--color-muted-foreground);">
      加载中...
    </view>

    <!-- Not Found -->
    <view v-else-if="notFound" class="card" style="margin: 16px;">
      <view class="text-foreground text-lg font-bold">未找到认养记录</view>
      <view class="text-muted-foreground text-sm" style="margin-top: 4px;">请返回田园重新选择田地和管护员。</view>
      <button data-test="return-garden" class="btn-primary w-full h-11 mt-3" @click="returnToGarden">
        返回田园
      </button>
    </view>

    <!-- Error -->
    <view v-else-if="error" class="card" style="margin: 16px;">
      <view class="text-foreground text-lg font-bold">认养记录加载失败</view>
      <view class="text-muted-foreground text-sm" style="margin-top: 4px;">{{ error }}</view>
      <button data-test="return-garden" class="btn-primary w-full h-11 mt-3" @click="returnToGarden">
        返回田园
      </button>
    </view>

    <!-- Detail -->
    <view v-else-if="adoption && field && caretaker" style="display: flex; flex-direction: column; gap: 12px; margin: 0 16px;">
      <!-- Status Hero -->
      <view class="card" style="background: linear-gradient(135deg, rgb(21 128 61 / 0.08), #ffffff);">
        <view style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <view class="text-primary text-sm font-bold">认养详情</view>
          <view
            class="text-xs font-bold"
            style="padding: 4px 10px; border-radius: 9999px; white-space: nowrap;"
            :style="{
              backgroundColor: adoption.status === 'pending_payment' ? 'rgb(245 158 11 / 0.1)' : 'rgb(21 128 61 / 0.1)',
              color: adoption.status === 'pending_payment' ? '#B45309' : '#15803D'
            }"
          >
            {{ statusText }}
          </view>
        </view>
        <view class="text-foreground text-xl font-bold" style="margin-top: 8px;">{{ field.name }}</view>
        <view class="text-muted-foreground text-sm" style="margin-top: 4px;">认养编号：{{ adoption.id }}</view>
        <view class="text-muted-foreground text-sm" style="margin-top: 2px;">创建时间：{{ adoption.createdAt }}</view>
      </view>

      <!-- Field Info -->
      <view class="card" style="display: flex; flex-direction: column; gap: 6px;">
        <view class="text-foreground text-base font-bold">田地信息</view>
        <view class="text-foreground text-sm">{{ field.name }} · {{ field.code }}</view>
        <view class="text-foreground text-sm">面积：{{ field.areaSquareMeters }}㎡</view>
        <view v-if="field.crop" class="text-foreground text-sm">
          作物：{{ field.crop.name }} · 生长进度 {{ field.crop.progressPercent }}%
        </view>
        <view v-if="field.expectedHarvestDate" class="text-muted-foreground text-sm">
          预计收获：{{ field.expectedHarvestDate }}
        </view>
        <view v-if="field.crop" style="height: 10px; overflow: hidden; border-radius: 9999px; background: var(--color-border); margin-top: 4px;">
          <view
            style="height: 100%; background: var(--color-primary); border-radius: 9999px;"
            :style="{ width: `${field.crop.progressPercent}%` }"
          />
        </view>
      </view>

      <!-- Caretaker Info -->
      <view class="card" style="display: flex; flex-direction: column; gap: 6px;">
        <view class="text-foreground text-base font-bold">管护员信息</view>
        <view style="display: flex; align-items: center; gap: 10px;">
          <image
            style="width: 48px; height: 48px; border-radius: 10px; background: rgb(21 128 61 / 0.1); object-fit: cover;"
            :src="caretaker.avatarUrl"
            :alt="caretaker.name"
          />
          <view style="display: flex; flex-direction: column; gap: 2px;">
            <view class="text-foreground text-sm font-bold">{{ caretaker.name }} · {{ caretaker.age }}岁</view>
            <view class="text-muted-foreground text-xs">{{ caretaker.village }} · {{ caretaker.experienceYears }}年经验</view>
            <view class="text-primary text-xs font-bold">{{ caretaker.rating.toFixed(1) }} ★ · {{ caretaker.reviewCount }}条评价</view>
          </view>
        </view>
      </view>

      <!-- Payment Info -->
      <view class="card" style="display: flex; flex-direction: column; gap: 6px;">
        <view class="text-foreground text-base font-bold">支付信息</view>
        <view class="text-muted-foreground text-sm">支付单号：{{ adoption.paymentOrderId }}</view>
        <view v-if="adoption.status === 'pending_payment'" class="text-amber-700 text-sm font-bold" style="margin-top: 2px;">
          待支付 — 请尽快完成支付以确认认养
        </view>
      </view>

      <!-- Actions -->
      <view v-if="adoption.status === 'pending_payment'" style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <button data-test="go-payment" class="btn-primary w-full h-11" @click="goToPayment">
          去支付
        </button>
        <button data-test="view-field-monitoring" class="btn-secondary w-full h-11" @click="viewFieldMonitoring">
          查看田地监控
        </button>
        <button data-test="return-garden" class="btn-secondary w-full h-11" @click="returnToGarden">
          返回田园
        </button>
      </view>
      <view v-else style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <button data-test="view-field-monitoring" class="btn-primary w-full h-11" @click="viewFieldMonitoring">
          查看田地监控
        </button>
        <button data-test="return-garden" class="btn-secondary w-full h-11" @click="returnToGarden">
          返回田园
        </button>
      </view>
    </view>
  </view>
</template>
