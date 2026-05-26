<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CaretakerAvatarCard from '../../components/CaretakerAvatarCard.vue'
import CaretakerDetailModal from '../../components/CaretakerDetailModal.vue'
import EmptyState from '../../components/EmptyState.vue'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
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
const contactModalOpen = ref(false)
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
  uni.showToast({ title: `已选择 ${caretaker.name}`, icon: 'none', duration: 1000 })
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

function showResponsibleFields(caretaker: Caretaker) {
  modalOpen.value = false
  uni.navigateTo({ url: `/pages/garden/index?keyword=${encodeURIComponent(caretaker.name)}` })
}

function openContactModal() {
  contactModalOpen.value = true
}

function closeContactModal() {
  contactModalOpen.value = false
}

function shareCaretaker(caretaker: Caretaker) {
  if (typeof uni.share === 'function') {
    uni.share({
      provider: 'weixin',
      type: 0,
      title: `推荐管护员 ${caretaker.name}`,
      summary: `${caretaker.name}，${caretaker.age}岁，${caretaker.village}，${caretaker.experienceYears}年管护经验，评分${caretaker.rating}分`,
      success: () => {},
      fail: () => {
        uni.showToast({ title: '分享失败', icon: 'none' })
      }
    })
  } else if (navigator.share) {
    navigator.share({
      title: `推荐管护员 ${caretaker.name}`,
      text: `${caretaker.name}，${caretaker.age}岁，${caretaker.village}，${caretaker.experienceYears}年管护经验，评分${caretaker.rating}分`,
      url: window.location.href
    }).catch(() => {})
  } else {
    uni.showToast({ title: '分享不可用', icon: 'none' })
  }
}

async function confirmSelection() {
  if (!selectedCaretaker.value) return

  uni.showToast({ title: '创建认养中...', icon: 'loading', duration: 2000 })

  try {
    const result = await createAdoption({ fieldId: props.fieldId, caretakerId: selectedCaretaker.value.id })
    uni.showToast({ title: '认养创建成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateTo({ url: result.nextUrl })
    }, 800)
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
    <!-- States -->
    <view v-if="loading" class="mx-4 mt-4 flex flex-col gap-3">
      <view class="text-foreground text-sm font-bold mb-2">系统推荐</view>
      <view style="display: flex; gap: 12px;">
        <SkeletonLoader v-for="n in 3" :key="n" type="avatar" />
      </view>
      <view class="text-foreground text-sm font-bold mb-2 mt-2">全部管护员</view>
      <view style="display: flex; gap: 12px;">
        <SkeletonLoader v-for="n in 4" :key="`all-${n}`" type="avatar" />
      </view>
    </view>
    <view v-else-if="error" class="mx-4 mt-6">
      <EmptyState
        title="加载失败"
        :description="error"
        action-text="重试"
        @action="loadCaretakers"
      />
    </view>

    <!-- Content -->
    <view v-else class="flex flex-col">
      <!-- Recommended -->
      <view class="mx-4 mt-4">
        <view class="block mb-3 text-foreground font-bold">系统推荐（3公里内）</view>
        <scroll-view scroll-x="true" show-scrollbar="false" style="width: 100%; white-space: nowrap;">
          <view style="display: inline-flex; flex-direction: row;">
            <CaretakerAvatarCard
              v-for="caretaker in recommendedCaretakers"
              :key="caretaker.id"
              :caretaker="caretaker"
              :selected="selectedCaretaker?.id === caretaker.id"
              @select="selectCaretaker"
              @detail="showDetail"
            />
          </view>
        </scroll-view>
      </view>

      <!-- All Caretakers -->
      <view class="mx-4 mt-4">
        <view class="block mb-3 text-foreground font-bold">全部管护员</view>
        <scroll-view scroll-x="true" show-scrollbar="false" style="width: 100%; white-space: nowrap;">
          <view style="display: inline-flex; flex-direction: row;">
            <CaretakerAvatarCard
              v-for="caretaker in allCaretakers"
              :key="caretaker.id"
              :caretaker="caretaker"
              :selected="selectedCaretaker?.id === caretaker.id"
              @select="selectCaretaker"
              @detail="showDetail"
            />
          </view>
        </scroll-view>
      </view>

      <!-- Selected Summary -->
      <view class="mx-4 mt-6 text-center text-muted-foreground">
        <view>{{ selectedCaretaker ? `已选择：${selectedCaretaker.name}` : '请选择一位管护员' }}</view>
      </view>
    </view>

    <!-- Confirm Bar -->
    <view class="fixed bottom-0 px-4 py-3 bg-card shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40" style="left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 480px;">
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
      @responsible-fields="showResponsibleFields"
      @contact="openContactModal"
      @share="shareCaretaker"
    />

    <!-- Contact Modal -->
    <view
      v-if="contactModalOpen"
      style="position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0, 0, 0, 0.4);"
      data-test="contact-modal"
    >
      <view class="card" style="width: 85%; max-width: 320px; display: flex; flex-direction: column; gap: 12px;">
        <view style="color: var(--color-foreground); font-size: 16px; font-weight: 700;">联系管护员</view>
        <view v-if="detailCaretaker?.phone" style="display: flex; flex-direction: column; gap: 8px;">
          <view style="color: var(--color-foreground); font-size: 14px;">{{ detailCaretaker.name }}：{{ detailCaretaker.phone }}</view>
          <button
            class="btn-primary w-full h-10"
            @click="() => detailCaretaker?.phone && uni.makePhoneCall({ phoneNumber: detailCaretaker.phone })"
          >
            拨打电话
          </button>
        </view>
        <view v-else style="color: var(--color-muted-foreground); font-size: 14px;">暂无可用联系方式</view>
        <button
          class="btn-primary w-full h-10"
          style="margin-top: 4px;"
          @click="closeContactModal"
        >
          关闭
        </button>
      </view>
    </view>
  </view>
</template>
