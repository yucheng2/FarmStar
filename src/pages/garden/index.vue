<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import FieldCard from '../../components/FieldCard.vue'
import FieldMapView from '../../components/FieldMapView.vue'
import CaretakerDetailModal from '../../components/CaretakerDetailModal.vue'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import EmptyState from '../../components/EmptyState.vue'
import { getCaretakerById, getFields } from '../../services/gardenApi'
import { isLoggedIn, logout } from '../../services/authApi'
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

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(keyword, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    void loadFields()
  }, 300)
})

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
  if (view === 'map' && selectedStatus.value) {
    selectedStatus.value = ''
    void loadFields()
  }
  uni.showToast({ title: view === 'list' ? '列表视图' : '地图视图', icon: 'none', duration: 800 })
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

function viewFieldAdoption() {
  if (!selectedField.value?.adoptionId) return
  uni.navigateTo({ url: `/pages/adoption/detail?adoption_id=${selectedField.value.adoptionId}` })
}

function viewMyAdoptions() {
  uni.navigateTo({ url: '/pages/adoption/index' })
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

function handleLogout() {
  logout()
  uni.showToast({ title: '已退出登录', icon: 'success' })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/login/index' })
  }, 500)
}

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

onMounted(() => {
  trackEvent({ event: 'page_view', userId: 'user-demo', pageName: 'garden' })
  void loadFields()
})
</script>

<template>
  <view class="min-h-dvh bg-background pb-6">
    <!-- Navigation -->
    <view style="display: flex; align-items: center; justify-content: space-between; margin: 0 16px; padding: 14px 0;">
      <view class="text-primary text-sm" style="width: 60px;">←</view>
      <view class="text-foreground text-lg font-bold">我的田园</view>
      <view
        v-if="isLoggedIn()"
        data-test="my-adoptions-entry"
        class="text-primary text-sm"
        style="width: 60px; text-align: right;"
        @click="viewMyAdoptions"
      >
        我的认养
      </view>
      <view
        v-else
        class="text-primary text-sm"
        style="width: 60px; text-align: right;"
        @click="goToLogin"
      >
        登录
      </view>
    </view>

    <!-- Search Row -->
    <view style="display: flex; align-items: center; gap: 8px; margin: 0 16px;">
      <input
        v-model="keyword"
        data-test="search-input"
        class="input-field"
        style="flex: 1; height: 36px; padding: 0 14px; font-size: 14px;"
        placeholder="搜索田地、作物、管护员"
      />
      <button
        data-test="search-button"
        class="btn-primary"
        style="width: 72px; height: 36px; padding: 0; font-size: 14px; border-radius: 18px;"
        @click="() => { if (searchTimeout) clearTimeout(searchTimeout); loadFields() }"
      >
        搜索
      </button>
    </view>

    <!-- Filter Row -->
    <view style="display: flex; align-items: center; gap: 8px; margin: 12px 16px 0; overflow-x: auto;">
      <button
        :class="selectedStatus === 'idle' ? 'btn-secondary-active' : 'btn-secondary'"
        style="height: 30px; padding: 0 14px; font-size: 13px; white-space: nowrap; flex-shrink: 0;"
        @click="selectedStatus = 'idle'; loadFields()"
      >
        可认养
      </button>
      <button
        :class="selectedStatus === '' ? 'btn-secondary-active' : 'btn-secondary'"
        style="height: 30px; padding: 0 14px; font-size: 13px; white-space: nowrap; flex-shrink: 0;"
        @click="selectedStatus = ''; loadFields()"
      >
        全部田地
      </button>
      <button
        :class="selectedStatus === 'adopted' ? 'btn-secondary-active' : 'btn-secondary'"
        style="height: 30px; padding: 0 14px; font-size: 13px; white-space: nowrap; flex-shrink: 0;"
        @click="selectedStatus = 'adopted'; loadFields()"
      >
        已被认养
      </button>
      <button
        :class="selectedStatus === 'ready_to_harvest' ? 'btn-secondary-active' : 'btn-secondary'"
        style="height: 30px; padding: 0 14px; font-size: 13px; white-space: nowrap; flex-shrink: 0;"
        @click="selectedStatus = 'ready_to_harvest'; loadFields()"
      >
        待收获
      </button>
    </view>

    <!-- Tabs -->
    <view style="display: flex; align-items: center; gap: 8px; margin: 10px 16px 0;">
      <button
        data-test="list-tab"
        :class="activeView === 'list' ? 'btn-secondary-active' : 'btn-secondary'"
        style="flex: 1; height: 30px; padding: 0; font-size: 13px; display: flex; align-items: center; justify-content: center;"
        @click="selectView('list')"
      >
        列表视图
      </button>
      <button
        data-test="map-tab"
        :class="activeView === 'map' ? 'btn-secondary-active' : 'btn-secondary'"
        style="flex: 1; height: 30px; padding: 0; font-size: 13px; display: flex; align-items: center; justify-content: center;"
        @click="selectView('map')"
      >
        地图视图
      </button>
    </view>

    <!-- Content States -->
    <view v-if="loading" style="margin-top: 16px;">
      <SkeletonLoader v-for="n in 3" :key="n" type="card" />
    </view>
    <view v-else-if="error" style="margin: 16px;">
      <EmptyState
        title="加载失败"
        :description="error"
        action-text="重试"
        @action="loadFields"
      />
    </view>
    <FieldMapView
      v-else-if="activeView === 'map'"
      :fields="fields"
      @marker-tap="showFieldDetails"
    />
    <view v-else-if="fields.length === 0" style="margin: 16px;">
      <EmptyState
        title="暂无田地"
        description="当前没有符合条件的田地，尝试调整筛选条件或稍后再试。"
        action-text="清除筛选"
        @action="selectedStatus = ''; loadFields()"
      />
    </view>
    <view v-else style="margin: 16px 16px 0; display: flex; flex-direction: column; gap: 12px;">
      <FieldCard
        v-for="field in fields"
        :key="field.id"
        :field="field"
        @adopt="adoptField"
        @details="showFieldDetails"
        @caretaker="openCaretaker"
      />
    </view>

    <!-- Field Detail Modal -->
    <view
      v-if="fieldDetailOpen && selectedField"
      style="position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0, 0, 0, 0.4);"
      data-test="field-detail-modal"
    >
      <view class="card" style="width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 10px;">
        <view style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
          <view class="text-foreground text-lg font-bold" style="flex: 1; word-break: break-all;">{{ selectedField.name }}</view>
          <button
            data-test="close-field-detail"
            style="height: 30px; padding: 0 12px; border-radius: 9999px; background: rgb(21 128 61 / 0.1); color: #15803D; font-size: 14px; border: none; cursor: pointer; flex-shrink: 0;"
            @click="closeFieldDetails"
          >
            关闭
          </button>
        </view>
        <view class="text-foreground text-sm">田地编号：{{ selectedField.code }}</view>
        <view class="text-foreground text-sm">面积：{{ selectedField.areaSquareMeters }}㎡</view>
        <view class="text-foreground text-sm">
          状态：{{ selectedField.status === 'adopted' ? '已认养' : selectedField.status }}
        </view>
        <view v-if="selectedField.crop" class="text-foreground text-sm">
          作物：{{ selectedField.crop.name }} · 生长进度 {{ selectedField.crop.progressPercent }}%
        </view>
        <view v-if="selectedField.expectedHarvestDate" class="text-foreground text-sm">
          预计收获：{{ selectedField.expectedHarvestDate }}
        </view>
        <view v-if="selectedField.caretaker" class="text-foreground text-sm">
          管护员：{{ selectedField.caretaker.name }} · {{ selectedField.caretaker.rating.toFixed(1) }} ★
        </view>
        <view v-if="selectedField.crop" style="height: 10px; overflow: hidden; border-radius: 9999px; background: var(--color-border);">
          <view
            style="height: 100%; background: var(--color-primary); border-radius: 9999px;"
            :style="{ width: `${selectedField.crop.progressPercent}%` }"
          />
        </view>
        <button
          v-if="selectedField.adoptionId"
          data-test="view-field-adoption"
          class="btn-primary"
          style="height: 40px; margin-top: 8px;"
          @click="viewFieldAdoption"
        >
          查看认养状态
        </button>
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
