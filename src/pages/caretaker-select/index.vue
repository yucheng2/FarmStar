<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CaretakerAvatarCard from '../../components/CaretakerAvatarCard.vue'
import CaretakerDetailModal from '../../components/CaretakerDetailModal.vue'
import { createAdoption, getCaretakers, getRecommendedCaretakers } from '../../services/gardenApi'
import { trackEvent } from '../../services/analytics'
import type { Caretaker } from '../../types/garden'

const props = withDefaults(defineProps<{
  fieldId?: string
}>(), {
  fieldId: 'field-001'
})

const recommendedCaretakers = ref<Caretaker[]>([])
const allCaretakers = ref<Caretaker[]>([])
const selectedCaretaker = ref<Caretaker | null>(null)
const detailCaretaker = ref<Caretaker | null>(null)
const modalOpen = ref(false)
const loading = ref(false)
const error = ref('')

async function loadCaretakers() {
  loading.value = true
  error.value = ''

  try {
    const [recommended, all] = await Promise.all([
      getRecommendedCaretakers(props.fieldId),
      getCaretakers()
    ])
    recommendedCaretakers.value = recommended.items
    allCaretakers.value = all.items
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : '管护员列表加载失败'
  } finally {
    loading.value = false
  }
}

function selectCaretaker(caretaker: Caretaker) {
  selectedCaretaker.value = caretaker
  trackEvent({ event: 'caretaker_select', userId: 'user-demo', fieldId: props.fieldId, caretakerId: caretaker.id })
}

function showDetail(caretaker: Caretaker) {
  detailCaretaker.value = caretaker
  modalOpen.value = true
  trackEvent({ event: 'caretaker_detail_view', userId: 'user-demo', caretakerId: caretaker.id })
}

function closeDetail() {
  modalOpen.value = false
}

function contactCaretaker() {
  uni.showToast({ title: '功能暂未开放', icon: 'none' })
}

async function confirmSelection() {
  if (!selectedCaretaker.value) return

  try {
    const result = await createAdoption({ fieldId: props.fieldId, caretakerId: selectedCaretaker.value.id })
    uni.navigateTo({ url: result.nextUrl })
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : '创建认养失败'
    uni.showToast({ title: message, icon: 'none' })
  }
}

onMounted(() => {
  void loadCaretakers()
})
</script>

<template>
  <view class="min-h-dvh pb-[82px] bg-background">
    <!-- Navigation -->
    <view class="flex items-center justify-between px-4 py-3.5">
      <text class="text-primary text-sm w-10">←</text>
      <text class="text-foreground text-lg font-bold">选择管护员</text>
      <text class="w-10" />
    </view>

    <!-- States -->
    <view v-if="loading" class="mx-4 mt-6 text-center text-muted-foreground">加载中...</view>
    <view v-else-if="error" class="mx-4 mt-6 text-center text-muted-foreground">{{ error }}</view>

    <!-- Content -->
    <view v-else class="flex flex-col">
      <!-- Recommended -->
      <view class="mx-4 mt-4">
        <text class="block mb-3 text-foreground font-bold">系统推荐（3公里内）</text>
        <view class="overflow-x-auto whitespace-nowrap -webkit-overflow-scrolling-touch">
          <view class="flex">
            <CaretakerAvatarCard
              v-for="caretaker in recommendedCaretakers"
              :key="caretaker.id"
              :caretaker="caretaker"
              :selected="selectedCaretaker?.id === caretaker.id"
              @select="selectCaretaker"
              @detail="showDetail"
            />
          </view>
        </view>
      </view>

      <!-- All Caretakers -->
      <view class="mx-4 mt-4">
        <text class="block mb-3 text-foreground font-bold">全部管护员</text>
        <view class="overflow-x-auto whitespace-nowrap -webkit-overflow-scrolling-touch">
          <view class="flex">
            <CaretakerAvatarCard
              v-for="caretaker in allCaretakers"
              :key="caretaker.id"
              :caretaker="caretaker"
              :selected="selectedCaretaker?.id === caretaker.id"
              @select="selectCaretaker"
              @detail="showDetail"
            />
          </view>
        </view>
      </view>

      <!-- Selected Summary -->
      <view class="mx-4 mt-6 text-center text-muted-foreground">
        <text>{{ selectedCaretaker ? `已选择：${selectedCaretaker.name}` : '请选择一位管护员' }}</text>
      </view>
    </view>

    <!-- Confirm Bar -->
    <view class="fixed right-0 bottom-0 left-0 w-full max-w-[480px] mx-auto px-4 py-3 bg-card shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40">
      <button
        data-test="confirm-selection"
        class="btn-primary w-full h-11 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!selectedCaretaker"
        @click="confirmSelection"
      >
        确认选择
      </button>
    </view>

    <CaretakerDetailModal
      :open="modalOpen"
      :caretaker="detailCaretaker"
      @close="closeDetail"
      @responsible-fields="closeDetail"
      @contact="contactCaretaker"
    />
  </view>
</template>
