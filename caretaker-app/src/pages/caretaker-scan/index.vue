<script setup lang="ts">
import { ref } from 'vue'

const scanning = ref(false)
const error = ref('')

// In a real uniapp app, this would use uni.scanCode
async function handleScan() {
  scanning.value = true
  error.value = ''

  try {
    // Mock scan result - in real app, use uni.scanCode API
    // const result = await uni.scanCode({ onlyFromCamera: true })
    // For demo, simulate scanning field-002
    const mockResult = {
      errMsg: 'scanCode:ok',
      result: 'field-002'
    }

    if (mockResult.result) {
      // Parse field code from result
      const fieldCode = mockResult.result
      if (fieldCode.startsWith('field-')) {
        uni.navigateTo({ url: `/pages/caretaker-care-log/index?field_id=${fieldCode}` })
      } else {
        error.value = '无效的田地二维码'
      }
    }
  } catch (e) {
    error.value = '扫码失败，请重试'
  } finally {
    scanning.value = false
  }
}
</script>

<template>
  <view class="min-h-dvh bg-background flex flex-col">
    <!-- Scanner Area -->
    <view class="flex-1 flex flex-col items-center justify-center p-6">
      <view class="relative">
        <!-- Scanner Frame -->
        <view class="w-64 h-64 border-4 border-primary rounded-2xl relative overflow-hidden">
          <view class="absolute inset-0 bg-black/20" />
          <!-- Corner markers -->
          <view class="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl" />
          <view class="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl" />
          <view class="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl" />
          <view class="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl" />
          <!-- Scan line -->
          <view class="absolute left-2 right-2 h-0.5 bg-primary animate-pulse top-1/2" />
        </view>
      </view>

      <view class="text-center mt-8">
        <view class="text-lg font-bold text-foreground">扫描田地二维码</view>
        <view class="text-sm text-muted-foreground mt-2">将田地二维码放入框内即可自动扫描</view>
      </view>

      <view v-if="error" class="mt-4 text-red-500 text-sm">
        {{ error }}
      </view>
    </view>

    <!-- Scan Button -->
    <view class="p-6">
      <button
        class="btn-primary w-full h-14 text-lg"
        :disabled="scanning"
        @click="handleScan"
      >
        {{ scanning ? '扫描中...' : '开始扫码' }}
      </button>
    </view>

    <!-- Demo hint -->
    <view class="text-center text-muted-foreground text-xs pb-6">
      测试：点击按钮模拟扫描 field-002
    </view>
  </view>
</template>
