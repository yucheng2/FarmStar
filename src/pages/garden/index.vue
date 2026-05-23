<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FieldCard from '../../components/FieldCard.vue'
import CaretakerDetailModal from '../../components/CaretakerDetailModal.vue'
import { getCaretakerById, getFields } from '../../services/gardenApi'
import { trackEvent } from '../../services/analytics'
import type { Caretaker, CaretakerSummary, Field, FieldFilters, FieldStatus } from '../../types/garden'

const fields = ref<Field[]>([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const selectedStatus = ref<FieldStatus | ''>('')
const activeView = ref<'list' | 'map'>('list')
const selectedCaretaker = ref<Caretaker | null>(null)
const selectedField = ref<Field | null>(null)
const modalOpen = ref(false)
const fieldDetailOpen = ref(false)

async function loadFields() {
  loading.value = true
  error.value = ''

  try {
    const filters: FieldFilters = {}
    if (keyword.value) filters.keyword = keyword.value
    if (selectedStatus.value) filters.status = selectedStatus.value
    const result = await getFields(filters)
    fields.value = result.items
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : '田地列表加载失败'
  } finally {
    loading.value = false
  }
}

function selectView(view: 'list' | 'map') {
  activeView.value = view
}

function adoptField(field: Field) {
  uni.navigateTo({ url: `/pages/caretaker-select/index?field_id=${field.id}` })
}

function showFieldDetails(field: Field) {
  selectedField.value = field
  fieldDetailOpen.value = true
}

function closeFieldDetails() {
  fieldDetailOpen.value = false
}

async function openCaretaker(caretakerSummary: CaretakerSummary | undefined) {
  if (!caretakerSummary) return
  trackEvent({ event: 'caretaker_click', userId: 'user-demo', caretakerId: caretakerSummary.id })
  selectedCaretaker.value = await getCaretakerById(caretakerSummary.id)
  modalOpen.value = true
  trackEvent({ event: 'caretaker_detail_view', userId: 'user-demo', caretakerId: caretakerSummary.id })
}

function closeCaretaker() {
  modalOpen.value = false
}

function filterResponsibleFields(caretaker: Caretaker) {
  keyword.value = caretaker.name
  modalOpen.value = false
  void loadFields()
}

function contactCaretaker() {
  uni.showToast({ title: '功能暂未开放', icon: 'none' })
}

onMounted(() => {
  trackEvent({ event: 'page_view', userId: 'user-demo', pageName: 'garden' })
  void loadFields()
})
</script>

<template>
  <view class="page">
    <view class="nav">
      <text class="back">←</text>
      <text class="title">我的田园</text>
      <text class="nav-action">筛选</text>
    </view>

    <view class="search-row">
      <input v-model="keyword" data-test="search-input" class="search-input" placeholder="搜索田地、作物、管护员" />
      <button data-test="search-button" class="search-button" @click="loadFields">搜索</button>
    </view>

    <view class="filter-row">
      <button :class="{ active: selectedStatus === '' }" @click="selectedStatus = ''; loadFields()">全部</button>
      <button :class="{ active: selectedStatus === 'idle' }" @click="selectedStatus = 'idle'; loadFields()">空闲</button>
      <button :class="{ active: selectedStatus === 'adopted' }" @click="selectedStatus = 'adopted'; loadFields()">已认养</button>
      <button :class="{ active: selectedStatus === 'ready_to_harvest' }" @click="selectedStatus = 'ready_to_harvest'; loadFields()">待收获</button>
    </view>

    <view class="tabs">
      <button data-test="list-tab" :class="{ active: activeView === 'list' }" @click="selectView('list')">列表视图</button>
      <button data-test="map-tab" :class="{ active: activeView === 'map' }" @click="selectView('map')">地图视图</button>
    </view>

    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="error" class="state">{{ error }}</view>
    <view v-else-if="activeView === 'map'" class="state">地图视图即将开放</view>
    <view v-else-if="fields.length === 0" class="state">暂无符合条件的田地</view>
    <view v-else>
      <FieldCard
        v-for="field in fields"
        :key="field.id"
        :field="field"
        @adopt="adoptField"
        @details="showFieldDetails"
        @caretaker="openCaretaker"
      />
    </view>

    <view v-if="fieldDetailOpen && selectedField" class="field-detail-mask" data-test="field-detail-modal">
      <view class="field-detail-panel">
        <view class="field-detail-header">
          <text class="field-detail-title">{{ selectedField.name }}</text>
          <button data-test="close-field-detail" @click="closeFieldDetails">关闭</button>
        </view>
        <text>田地编号：{{ selectedField.code }}</text>
        <text>面积：{{ selectedField.areaSquareMeters }}㎡</text>
        <text>状态：{{ selectedField.status === 'adopted' ? '已认养' : selectedField.status }}</text>
        <text v-if="selectedField.crop">作物：{{ selectedField.crop.name }} · 生长进度 {{ selectedField.crop.progressPercent }}%</text>
        <text v-if="selectedField.expectedHarvestDate">预计收获：{{ selectedField.expectedHarvestDate }}</text>
        <text v-if="selectedField.caretaker">管护员：{{ selectedField.caretaker.name }} · {{ selectedField.caretaker.rating.toFixed(1) }} ★</text>
        <view v-if="selectedField.crop" class="detail-progress-track">
          <view class="detail-progress-fill" :style="{ width: `${selectedField.crop.progressPercent}%` }" />
        </view>
      </view>
    </view>

    <CaretakerDetailModal
      :open="modalOpen"
      :caretaker="selectedCaretaker"
      @close="closeCaretaker"
      @responsible-fields="filterResponsibleFields"
      @contact="contactCaretaker"
    />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f6fbf3;
  padding-bottom: 24px;
}

.nav,
.search-row,
.filter-row,
.tabs {
  display: flex;
  align-items: center;
  margin: 0 16px;
}

.nav {
  justify-content: space-between;
  padding: 14px 0;
}

.title {
  color: #2d3a2d;
  font-size: 18px;
  font-weight: 700;
}

.back,
.nav-action {
  color: #4caf50;
  font-size: 14px;
}

.search-row {
  gap: 8px;
}

.search-input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #dde8d8;
  border-radius: 999px;
  background: #ffffff;
  box-sizing: border-box;
}

.search-button,
.filter-row button,
.tabs button {
  border: 0;
  border-radius: 999px;
  background: #ffffff;
  color: #6b766b;
}

.search-button {
  width: 72px;
  height: 38px;
  background: #4caf50;
  color: #ffffff;
}

.filter-row,
.tabs {
  gap: 8px;
  margin-top: 12px;
}

.filter-row button,
.tabs button {
  height: 32px;
  padding: 0 12px;
}

.filter-row button.active,
.tabs button.active {
  background: #4caf50;
  color: #ffffff;
}

.state {
  margin: 40px 16px;
  color: #6b766b;
  text-align: center;
}

.field-detail-mask {
  position: fixed;
  inset: 0;
  z-index: 18;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.36);
  box-sizing: border-box;
}

.field-detail-panel {
  display: flex;
  width: 100%;
  max-width: 420px;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 18px;
  background: #ffffff;
  color: #2d3a2d;
  box-sizing: border-box;
}

.field-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field-detail-title {
  font-size: 18px;
  font-weight: 700;
}

.field-detail-header button {
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: #eef6ea;
  color: #4caf50;
}

.detail-progress-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6eee3;
}

.detail-progress-fill {
  height: 100%;
  background: #4caf50;
}
</style>
