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
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

const resolvedAdoptionId = computed(() => props.adoptionId ?? props.adoption_id ?? '')

async function loadData() {
  loading.value = true
  error.value = ''

  if (!resolvedAdoptionId.value) {
    error.value = '缺少认养编号'
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
    error.value = caughtError instanceof Error ? caughtError.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function confirmPayment() {
  if (!adoption.value) return
  submitting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    submitted.value = true
    trackEvent({ event: 'page_view', userId: 'user-demo', pageName: 'payment_success' })
  } catch {
    error.value = '支付处理失败，请重试'
  } finally {
    submitting.value = false
  }
}

function viewAdoptionDetail() {
  if (!adoption.value) return
  uni.navigateTo({ url: `/pages/adoption/detail?adoption_id=${adoption.value.id}` })
}

function returnToGarden() {
  uni.navigateTo({ url: '/pages/garden/index' })
}

onMounted(() => {
  trackEvent({ event: 'page_view', userId: 'user-demo', pageName: 'payment_confirm' })
  void loadData()
})
</script>

<template>
  <view class="min-h-dvh bg-background pb-6">
    <!-- Loading -->
    <view v-if="loading" style="margin: 40px 16px; text-align: center; color: var(--color-muted-foreground);">
      加载中...
    </view>

    <!-- Error -->
    <view v-else-if="error" class="card" style="margin: 16px;">
      <view class="text-foreground text-lg font-bold">{{ error }}</view>
      <button data-test="return-garden" class="btn-primary w-full h-11 mt-3" @click="returnToGarden">
        返回田园
      </button>
    </view>

    <!-- Success -->
    <view v-else-if="submitted && adoption && field && caretaker" style="display: flex; flex-direction: column; gap: 12px; margin: 0 16px;">
      <view class="card" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 32px 16px;">
        <view style="width: 56px; height: 56px; border-radius: 9999px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: 700;">
          ✓
        </view>
        <view class="text-foreground text-xl font-bold">支付成功</view>
        <view class="text-muted-foreground text-sm">你已成功认养 {{ field.name }}</view>
        <view class="text-muted-foreground text-sm">认养编号：{{ adoption.id }}</view>
      </view>

      <view class="card" style="display: flex; flex-direction: column; gap: 6px;">
        <view class="text-foreground text-base font-bold">认养信息</view>
        <view class="text-foreground text-sm">田地：{{ field.name }} · {{ field.areaSquareMeters }}㎡</view>
        <view class="text-foreground text-sm">管护员：{{ caretaker.name }}</view>
        <view v-if="field.expectedHarvestDate" class="text-muted-foreground text-sm">
          预计收获：{{ field.expectedHarvestDate }}
        </view>
      </view>

      <view style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <button data-test="view-adoption-detail" class="btn-primary w-full h-11" @click="viewAdoptionDetail">
          查看认养详情
        </button>
        <button data-test="return-garden" class="btn-secondary w-full h-11" @click="returnToGarden">
          返回田园
        </button>
      </view>
    </view>

    <!-- Confirm -->
    <view v-else-if="adoption && field && caretaker" style="display: flex; flex-direction: column; gap: 12px; margin: 0 16px;">
      <!-- Header -->
      <view class="card" style="background: linear-gradient(135deg, rgb(21 128 61 / 0.08), #ffffff);">
        <view style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <view class="text-primary text-sm font-bold">确认认养</view>
          <view class="text-xs font-bold" style="padding: 4px 10px; border-radius: 9999px; background: rgb(245 158 11 / 0.1); color: #B45309; white-space: nowrap;">
            待支付
          </view>
        </view>
        <view class="text-foreground text-xl font-bold" style="margin-top: 8px;">{{ field.name }}</view>
        <view class="text-muted-foreground text-sm" style="margin-top: 4px;">认养编号：{{ adoption.id }}</view>
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
        <view style="display: flex; align-items: center; justify-content: space-between;">
          <view class="text-muted-foreground text-sm">认养费用</view>
          <view class="text-foreground text-lg font-bold">¥{{ (field.areaSquareMeters * 10).toFixed(2) }}</view>
        </view>
        <view style="display: flex; align-items: center; justify-content: space-between;">
          <view class="text-muted-foreground text-sm">管护服务费</view>
          <view class="text-foreground text-sm">¥{{ (field.areaSquareMeters * 2).toFixed(2) }}</view>
        </view>
        <view style="height: 1px; background: var(--color-border); margin: 4px 0;" />
        <view style="display: flex; align-items: center; justify-content: space-between;">
          <view class="text-foreground text-sm font-bold">合计</view>
          <view class="text-primary text-xl font-bold">¥{{ (field.areaSquareMeters * 12).toFixed(2) }}</view>
        </view>
        <view class="text-muted-foreground text-xs" style="margin-top: 2px;">支付单号：{{ adoption.paymentOrderId }}</view>
      </view>

      <!-- Actions -->
      <view style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <button
          data-test="pay-button"
          class="btn-primary w-full h-11"
          :disabled="submitting"
          @click="confirmPayment"
        >
          {{ submitting ? '处理中...' : `确认支付 ¥${(field.areaSquareMeters * 12).toFixed(2)}` }}
        </button>
        <button data-test="return-garden" class="btn-secondary w-full h-11" @click="returnToGarden">
          取消并返回
        </button>
      </view>
    </view>
  </view>
</template>
