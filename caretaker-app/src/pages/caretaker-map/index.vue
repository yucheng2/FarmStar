<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import FieldInfoCard from '../../components/FieldInfoCard.vue'
import { getCareTakerInfo } from '../../services/authApi'
import { getCaretakerFields } from '../../services/caretakerApi'
import type { Field } from '../../types/garden'

const caretaker = getCareTakerInfo()
const fields = ref<Field[]>([])
const loading = ref(false)
const selectedField = ref<Field | null>(null)
const activeTab = ref<'home' | 'map' | 'scan' | 'profile'>('map')

onMounted(() => {
  void loadFields()
})

async function loadFields() {
  if (!caretaker) return
  loading.value = true
  try {
    fields.value = await getCaretakerFields(caretaker.id)
  } finally {
    loading.value = false
  }
}

function handleMarkerTap(field: Field) {
  selectedField.value = field
}

function handleCloseDetail() {
  selectedField.value = null
}

function goToCareLog(field: Field) {
  uni.navigateTo({ url: `/pages/caretaker-care-log/index?field_id=${field.id}` })
}

function handleNav(tab: 'home' | 'map' | 'scan' | 'profile') {
  activeTab.value = tab
  if (tab === 'home') {
    uni.switchTab({ url: '/pages/caretaker-home/index' })
  } else if (tab === 'scan') {
    uni.navigateTo({ url: '/pages/caretaker-scan/index' })
  } else if (tab === 'profile') {
    uni.switchTab({ url: '/pages/caretaker-profile/index' })
  }
}

// Simple mock map positions for display
const fieldPositions: Record<string, { x: number; y: number }> = {
  'field-001': { x: 20, y: 30 },
  'field-002': { x: 50, y: 40 },
  'field-008': { x: 70, y: 60 }
}
</script>

<template>
  <view class="min-h-dvh bg-background pb-20">
    <!-- Map Area (simplified mock) -->
    <view class="relative h-dvh">
      <!-- Mock Map Background -->
      <view class="absolute inset-0 bg-gradient-to-b from-green-100 to-green-200">
        <view class="absolute inset-0 opacity-20">
          <!-- Grid lines -->
          <view v-for="i in 5" :key="'h'+i" class="absolute w-full h-px bg-green-800" :style="{ top: `${i * 20}%` }" />
          <view v-for="i in 5" :key="'v'+i" class="absolute h-full w-px bg-green-800" :style="{ left: `${i * 20}%` }" />
        </view>

        <!-- Field Markers -->
        <view
          v-for="field in fields"
          :key="field.id"
          class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          :style="{ left: `${fieldPositions[field.id]?.x || 50}%`, top: `${fieldPositions[field.id]?.y || 50}%` }"
          @click="handleMarkerTap(field)"
        >
          <view class="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <text class="text-xl">🌱</text>
          </view>
          <view class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-xs px-2 py-1 rounded">
            {{ field.name }}
          </view>
        </view>
      </view>

      <!-- Field Detail Card -->
      <view
        v-if="selectedField"
        class="absolute bottom-24 left-4 right-4 card"
      >
        <view class="flex justify-between items-start mb-3">
          <view class="font-bold text-foreground">{{ selectedField.name }}</view>
          <button class="text-muted-foreground text-xl" @click="handleCloseDetail">×</button>
        </view>
        <FieldInfoCard :field="selectedField" class="mb-3" />
        <button class="btn-primary w-full" @click="goToCareLog(selectedField)">
          开始养护
        </button>
      </view>
    </view>

    <BottomNav :active="activeTab" @navigate="handleNav" />
  </view>
</template>
