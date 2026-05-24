<script setup lang="ts">
import { ref } from 'vue'
import { caretakerLogin, sendVerifyCode } from '../../services/authApi'
import { useCareTakerAuth } from '../../composables/useCareTakerAuth'
import { uni } from '../../utils/uni-mock'

const phone = ref('')
const code = ref('')
const loading = ref(false)
const error = ref('')
const countdown = ref(0)

const { updateAuth } = useCareTakerAuth()

async function handleSendCode() {
  if (countdown.value > 0) return
  try {
    await sendVerifyCode(phone.value)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '发送失败'
  }
}

async function handleLogin() {
  if (!phone.value || !code.value) {
    error.value = '请输入手机号和验证码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await caretakerLogin(phone.value, code.value)
    updateAuth()
    uni.reLaunch({ url: '/pages/caretaker-home/index' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="min-h-dvh bg-background flex flex-col items-center justify-center">
    <!-- Logo Area -->
    <view class="pb-4 text-center">
      <view class="flex items-center justify-center gap-3">
        <view class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
          <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </view>
        <view class="flex items-baseline">
          <text class="text-2xl font-bold text-primary">FarmStar</text>
          <text class="text-base font-bold text-primary ml-1">智慧田园</text>
        </view>
      </view>
    </view>

    <!-- Form -->
    <view class="px-6">
      <view class="space-y-3">
        <!-- Phone -->
        <view>
          <text class="text-sm font-medium text-foreground mb-2 block">手机号</text>
          <input
            v-model="phone"
            class="w-full h-12 px-4 bg-white border border-border rounded-xl text-base focus:border-primary focus:outline-none transition-colors"
            type="tel"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>

        <!-- Code -->
        <view>
          <text class="text-sm font-medium text-foreground mb-2 block">验证码</text>
          <view class="flex gap-3">
            <input
              v-model="code"
              class="flex-1 h-12 px-4 bg-white border border-border rounded-xl text-base focus:border-primary focus:outline-none transition-colors"
              type="text"
              inputmode="numeric"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <button
              class="px-4 h-12 bg-primary text-white rounded-xl font-medium text-sm whitespace-nowrap active:opacity-80 transition-opacity disabled:opacity-50"
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>
        </view>

        <!-- Error -->
        <view v-if="error" class="p-3 bg-red-50 border border-red-100 rounded-xl">
          <text class="text-sm text-red-600">{{ error }}</text>
        </view>

        <!-- Login -->
        <button
          class="w-full h-12 bg-primary text-white rounded-xl font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 mt-4"
          :disabled="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </view>

      <!-- Hint -->
      <view class="mt-4 flex justify-center w-full">
        <text class="text-xs text-muted-foreground">测试验证码: 123456</text>
      </view>
    </view>
  </view>
</template>
