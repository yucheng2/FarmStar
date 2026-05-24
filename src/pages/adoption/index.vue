<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getMyAdoptions } from '../../services/gardenApi'
import type { AdoptionListItem } from '../../types/garden'

const adoptions = ref<AdoptionListItem[]>([])
const loading = ref(false)
const error = ref('')

const hasAdoptions = computed(() => adoptions.value.length > 0)

function statusText(status: AdoptionListItem['status']) {
  if (status === 'pending_payment') return '申请已提交'
  if (status === 'active') return '认养中'
  if (status === 'completed') return '已完成'
  return '已取消'
}

async function loadAdoptions() {
  loading.value = true
  error.value = ''

  try {
    const result = await getMyAdoptions()
    adoptions.value = result.items
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : '认养记录加载失败'
  } finally {
    loading.value = false
  }
}

function viewAdoptionDetail(adoptionId: string) {
  uni.navigateTo({ url: `/pages/adoption/detail?adoption_id=${adoptionId}` })
}

function goToGarden() {
  uni.navigateTo({ url: '/pages/garden/index' })
}

onMounted(() => {
  void loadAdoptions()
})
</script>

<template>
  <view class="min-h-dvh p-4 bg-background">
    <!-- Hero -->
    <view class="card mb-3" style="background: linear-gradient(135deg, rgb(21 128 61 / 0.08), #ffffff);">
      <view class="text-primary text-sm font-bold">FarmStar</view>
      <view class="text-foreground text-xl font-bold mt-1">我的认养</view>
      <view class="text-muted-foreground text-sm leading-relaxed mt-1">
        集中查看你已提交的田地认养申请和管护状态。
      </view>
    </view>

    <!-- Loading -->
    <view class="card" v-if="loading">
      <view class="text-foreground text-lg font-bold">加载中...</view>
    </view>

    <!-- Error -->
    <view class="card" v-else-if="error">
      <view class="text-foreground text-lg font-bold">认养记录加载失败</view>
      <view class="text-muted-foreground text-sm">{{ error }}</view>
      <button data-test="return-garden" class="btn-primary w-full h-11 mt-3" @click="goToGarden">
        返回田园
      </button>
    </view>

    <!-- Empty -->
    <view class="card" v-else-if="!hasAdoptions">
      <view class="text-foreground text-lg font-bold">暂无认养记录</view>
      <view class="text-muted-foreground text-sm">去田园选择一块可认养田地，提交后会出现在这里。</view>
      <button data-test="go-adopt-field" class="btn-primary w-full h-11 mt-3" @click="goToGarden">
        去认养田地
      </button>
    </view>

    <!-- List -->
    <view v-else class="flex flex-col gap-3">
      <view v-for="item in adoptions" :key="item.id" class="card gap-2">
        <!-- Header: Name + Status -->
        <view style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <view class="text-foreground text-base font-bold" style="flex: 1;">{{ item.field.name }}</view>
          <view
            class="text-xs font-bold shrink-0"
            style="padding: 4px 10px; border-radius: 9999px; background-color: rgb(21 128 61 / 0.1); color: #15803D; white-space: nowrap;"
          >
            {{ statusText(item.status) }}
          </view>
        </view>

        <view class="text-muted-foreground text-sm">{{ item.field.code }} · {{ item.field.areaSquareMeters }}㎡</view>

        <view v-if="item.field.crop" class="text-foreground text-sm">
          作物：{{ item.field.crop.name }} · 生长进度 {{ item.field.crop.progressPercent }}%
        </view>

        <view v-if="item.field.expectedHarvestDate" class="text-muted-foreground text-sm">
          预计收获：{{ item.field.expectedHarvestDate }}
        </view>

        <view class="text-muted-foreground text-sm">
          管护员：{{ item.caretaker.name }} · {{ item.caretaker.experienceYears }}年经验
        </view>

        <view class="text-muted-foreground text-xs">创建时间：{{ item.createdAt }}</view>

        <button data-test="view-adoption-detail" class="btn-primary w-full h-11 mt-1" @click="viewAdoptionDetail(item.id)">
          查看详情
        </button>
      </view>
    </view>
  </view>
</template>
