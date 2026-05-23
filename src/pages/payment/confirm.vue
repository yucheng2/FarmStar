<script setup lang="ts">
import { ref } from 'vue'
import { getStoredAdoption } from '../../services/gardenApi'
import type { Adoption } from '../../types/garden'

const props = withDefaults(defineProps<{
  adoptionId?: string
}>(), {
  adoptionId: 'adoption-field-001-caretaker-zhang'
})

const adoption = ref<Adoption | undefined>(getStoredAdoption(props.adoptionId))

function pay() {
  uni.showToast({ title: '支付功能暂未开放', icon: 'none' })
}
</script>

<template>
  <view class="page">
    <view class="card" v-if="adoption">
      <text class="title">认养待支付</text>
      <text>认养编号：{{ adoption.id }}</text>
      <text>田地编号：{{ adoption.fieldId }}</text>
      <text>管护员编号：{{ adoption.caretakerId }}</text>
      <text>支付单号：{{ adoption.paymentOrderId }}</text>
      <button data-test="pay-button" @click="pay">去支付</button>
    </view>
    <view class="card" v-else>
      <text class="title">未找到认养记录</text>
      <text>请返回田园重新选择田地和管护员。</text>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 16px;
  background: #f6fbf3;
  box-sizing: border-box;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 16px;
  background: #ffffff;
  color: #2d3a2d;
}

.title {
  font-size: 18px;
  font-weight: 700;
}

button {
  height: 44px;
  margin-top: 12px;
  border: 0;
  border-radius: 999px;
  background: #4caf50;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}
</style>
