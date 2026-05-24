<script setup lang="ts">
import { ref } from 'vue'
import { caretakerLogin, sendVerifyCode } from '../../../services/authApi'
import { useCareTakerAuth } from '../../../composables/useCareTakerAuth'

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
  <view class="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
    <view class="w-full max-w-sm">
      <!-- Logo -->
      <view class="text-center mb-8">
        <view class="text-3xl font-bold text-primary mb-2">FarmStar</view>
        <view class="text-muted-foreground">养护员登录</view>
      </view>

      <!-- Form -->
      <view class="card space-y-4">
        <view>
          <input
            v-model="phone"
            class="input-field w-full"
            type="tel"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>
        <view class="flex gap-2">
          <input
            v-model="code"
            class="input-field flex-1"
            type="number"
            placeholder="验证码"
            maxlength="6"
          />
          <button
            class="btn-secondary px-4"
            :disabled="countdown > 0"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </button>
        </view>

        <view v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </view>

        <button
          class="btn-primary w-full h-12"
          :disabled="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>

      <!-- Demo hint -->
      <view class="text-center text-muted-foreground text-xs mt-4">
        测试验证码: 123456
      </view>
    </view>
  </view>
</template>