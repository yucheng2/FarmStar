<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import FieldCard from '../../components/FieldCard.vue'
import FieldMapView from '../../components/FieldMapView.vue'
import CaretakerDetailModal from '../../components/CaretakerDetailModal.vue'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import EmptyState from '../../components/EmptyState.vue'
import NotificationToast from '../../components/NotificationToast.vue'
import { getCaretakerById, getFields } from '../../services/gardenApi'
import { isLoggedIn, logout } from '../../services/authApi'
import { trackEvent } from '../../services/analytics'
import { useNotifications } from '../../composables/useNotifications'
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

const { notifications, dismissNotification, markAsRead } = useNotifications()

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

function viewFieldMonitoring() {
  if (!selectedField.value) return
  uni.navigateTo({ url: `/pages/field-monitoring/index?field_id=${selectedField.value.id}` })
}

function viewMyAdoptions() {
  uni.navigateTo({ url: '/pages/adoption/index' })
}

function viewProfile() {
  uni.navigateTo({ url: '/pages/profile/index' })
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

function shareCaretaker(caretaker: Caretaker) {
  const shareData = {
    title: `${caretaker.name} · ${caretaker.village}管护员`,
    desc: `${caretaker.experienceYears}年经验 · ${caretaker.rating.toFixed(1)}★ · 擅长${caretaker.specialties.join('/')}`,
    path: `/pages/garden/index`
  }
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
  uni.showToast({ title: '分享准备就绪', icon: 'none' })
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
  <NotificationToast
    :notifications="notifications"
    @dismiss="dismissNotification"
    @mark-read="markAsRead"
  />
  <view class="min-h-dvh bg-background pb-6">
    <!-- Search Row -->
    <view style="display: flex; align-items: center; gap: 8px; margin: 4px 16px 0;">
      <input
        v-model="keyword"
        data-test="search-input"
        class="input-field"
        style="flex: 1; height: 32px; padding: 0 14px; font-size: 14px;"
        placeholder="搜索田地、作物、管护员"
      />
      <button
        data-test="search-button"
        aria-label="搜索"
        style="width: 32px; height: 32px; padding: 0; border-radius: 9999px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--color-primary); color: var(--color-primary-foreground); border: none; cursor: pointer;"
        @click="() => { if (searchTimeout) clearTimeout(searchTimeout); loadFields() }"
      >
        <svg
          data-test="search-icon"
          width="18"
          height="18"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="width: 18px; height: 18px; flex-shrink: 0;"
          aria-hidden="true"
        >
          <circle cx="13" cy="13" r="8" />
          <path d="m23 23-5-5" />
        </svg>
      </button>
      <button
        v-if="isLoggedIn()"
        data-test="profile-entry"
        style="width: 56px; height: 32px; padding: 0; border-radius: 16px; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--color-card); color: var(--color-muted-foreground); border: 1px solid var(--color-border); cursor: pointer;"
        @click="viewProfile"
      >
        我的
      </button>
      <button
        v-else
        style="width: 56px; height: 32px; padding: 0; border-radius: 16px; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--color-card); color: var(--color-muted-foreground); border: 1px solid var(--color-border); cursor: pointer;"
        @click="goToLogin"
      >
        登录
      </button>
    </view>

    <!-- Filter Row -->
    <view style="display: flex; align-items: center; gap: 8px; margin: 2px 16px 0; overflow-x: auto; height: 36px;">
      <button
        :class="selectedStatus === 'idle' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]' : 'bg-[var(--color-card)] text-[var(--color-muted-foreground)] border-[var(--color-border)]'"
        style="height: 32px; padding: 0 14px; font-size: 13px; white-space: nowrap; flex-shrink: 0; display: flex; justify-content: center; align-items: center; border-width: 1px; border-style: solid; border-radius: 9999px;"
        @click="selectedStatus = 'idle'; loadFields()"
      >
        可认养
      </button>
      <button
        :class="selectedStatus === '' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]' : 'bg-[var(--color-card)] text-[var(--color-muted-foreground)] border-[var(--color-border)]'"
        style="height: 32px; padding: 0 14px; font-size: 13px; white-space: nowrap; flex-shrink: 0; display: flex; justify-content: center; align-items: center; border-width: 1px; border-style: solid; border-radius: 9999px;"
        @click="selectedStatus = ''; loadFields()"
      >
        全部田地
      </button>
      <button
        :class="selectedStatus === 'adopted' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]' : 'bg-[var(--color-card)] text-[var(--color-muted-foreground)] border-[var(--color-border)]'"
        style="height: 32px; padding: 0 14px; font-size: 13px; white-space: nowrap; flex-shrink: 0; display: flex; justify-content: center; align-items: center; border-width: 1px; border-style: solid; border-radius: 9999px;"
        @click="selectedStatus = 'adopted'; loadFields()"
      >
        已被认养
      </button>
      <button
        :class="selectedStatus === 'ready_to_harvest' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]' : 'bg-[var(--color-card)] text-[var(--color-muted-foreground)] border-[var(--color-border)]'"
        style="height: 32px; padding: 0 14px; font-size: 13px; white-space: nowrap; flex-shrink: 0; display: flex; justify-content: center; align-items: center; border-width: 1px; border-style: solid; border-radius: 9999px;"
        @click="selectedStatus = 'ready_to_harvest'; loadFields()"
      >
        待收获
      </button>
    </view>

    <!-- Tabs -->
    <view style="display: flex; align-items: center; gap: 8px; margin: 4px 16px 0;">
      <button
        data-test="list-tab"
        :class="activeView === 'list' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]' : 'bg-[var(--color-card)] text-[var(--color-muted-foreground)] border-[var(--color-border)]'"
        style="flex: 1; height: 28px; padding: 0; font-size: 13px; display: flex; align-items: center; justify-content: center; border-width: 1px; border-style: solid; border-radius: 14px;"
        @click="selectView('list')"
      >
        列表视图
      </button>
      <button
        data-test="map-tab"
        :class="activeView === 'map' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]' : 'bg-[var(--color-card)] text-[var(--color-muted-foreground)] border-[var(--color-border)]'"
        style="flex: 1; height: 28px; padding: 0; font-size: 13px; display: flex; align-items: center; justify-content: center; border-width: 1px; border-style: solid; border-radius: 14px;"
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
        <button
          v-if="selectedField.adoptionId"
          data-test="view-field-monitoring"
          class="btn-secondary"
          style="height: 40px; margin-top: 8px;"
          @click="viewFieldMonitoring"
        >
          查看田地监控
        </button>
      </view>
    </view>

    <CaretakerDetailModal
      :open="modalOpen"
      :caretaker="selectedCaretaker"
      @close="closeCaretaker"
      @responsible-fields="filterResponsibleFields"
      @contact="contactCaretaker"
      @share="shareCaretaker"
    />
  </view>
</template>
