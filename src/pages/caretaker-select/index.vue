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
  <view class="page">
    <view class="nav">
      <text class="back">←</text>
      <text class="title">选择管护员</text>
      <text class="spacer" />
    </view>

    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="error" class="state">{{ error }}</view>
    <view v-else class="content">
      <view class="section">
        <text class="section-title">系统推荐（3公里内）</text>
        <view class="caretaker-scroll">
          <view class="caretaker-row">
            <CaretakerAvatarCard
              v-for="caretaker in recommendedCaretakers"
              :key="caretaker.id"
              class="caretaker-card"
              :caretaker="caretaker"
              :selected="selectedCaretaker?.id === caretaker.id"
              @select="selectCaretaker"
              @detail="showDetail"
            />
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">全部管护员</text>
        <view class="caretaker-scroll">
          <view class="caretaker-row">
            <CaretakerAvatarCard
              v-for="caretaker in allCaretakers"
              :key="caretaker.id"
              class="caretaker-card"
              :caretaker="caretaker"
              :selected="selectedCaretaker?.id === caretaker.id"
              @select="selectCaretaker"
              @detail="showDetail"
            />
          </view>
        </view>
      </view>

      <view class="selected-summary">
        <text>{{ selectedCaretaker ? `已选择：${selectedCaretaker.name}` : '请选择一位管护员' }}</text>
      </view>
    </view>

    <view class="confirm-bar">
      <button data-test="confirm-selection" :disabled="!selectedCaretaker" @click="confirmSelection">确认选择</button>
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

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 82px;
  background: #f6fbf3;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.title {
  color: #2d3a2d;
  font-size: 18px;
  font-weight: 700;
}

.back,
.spacer {
  width: 40px;
  color: #4caf50;
}

.section {
  margin: 16px;
}

.section-title {
  display: block;
  margin-bottom: 12px;
  color: #2d3a2d;
  font-weight: 700;
}

.caretaker-scroll {
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.caretaker-row {
  display: flex;
}

.selected-summary,
.state {
  margin: 24px 16px;
  color: #6b766b;
  text-align: center;
}

.confirm-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 12px 16px;
  background: #ffffff;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
}

.confirm-bar button {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.confirm-bar button[disabled] {
  background: #b7c5b1;
}
</style>
