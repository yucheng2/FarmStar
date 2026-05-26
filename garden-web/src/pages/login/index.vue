<script setup lang="ts">
import { ref } from 'vue'
import { login, register } from '../../services/authApi'

const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!username.value || !password.value) {
    error.value = '请填写用户名和密码'
    return
  }

  if (mode.value === 'register' && password.value !== confirmPassword.value) {
    error.value = '两次密码不一致'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (mode.value === 'login') {
      await login(username.value, password.value)
    } else {
      await register(username.value, password.value)
    }
    uni.reLaunch({ url: '/pages/garden/index' })
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : '操作失败'
  } finally {
    loading.value = false
  }
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
}

function skipLogin() {
  uni.reLaunch({ url: '/pages/garden/index' })
}
</script>

<template>
  <view class="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
    <view class="w-full max-w-sm flex flex-col gap-6">
      <!-- Logo -->
      <view class="text-center">
        <view class="text-primary text-3xl font-bold">FarmStar</view>
        <view class="text-muted-foreground text-sm mt-2">
          {{ mode === 'login' ? '登录你的账号' : '创建新账号' }}
        </view>
      </view>

      <!-- Form -->
      <view class="card flex flex-col gap-4">
        <view class="flex flex-col gap-1">
          <view class="text-foreground text-sm font-bold">用户名</view>
          <input
            v-model="username"
            class="input-field"
            style="height: 44px;"
            placeholder="请输入用户名"
          />
        </view>

        <view class="flex flex-col gap-1">
          <view class="text-foreground text-sm font-bold">密码</view>
          <input
            v-model="password"
            class="input-field"
            style="height: 44px;"
            type="password"
            placeholder="请输入密码"
          />
        </view>

        <view v-if="mode === 'register'" class="flex flex-col gap-1">
          <view class="text-foreground text-sm font-bold">确认密码</view>
          <input
            v-model="confirmPassword"
            class="input-field"
            style="height: 44px;"
            type="password"
            placeholder="请再次输入密码"
          />
        </view>

        <view v-if="error" class="text-destructive text-sm">{{ error }}</view>

        <button
          class="btn-primary w-full h-11 border border-primary"
          :disabled="loading"
          @click="submit"
        >
          {{ loading ? '处理中...' : mode === 'login' ? '登录' : '注册' }}
        </button>

        <!-- Loading Overlay -->
        <view
          v-if="loading"
          style="position: fixed; inset: 0; background: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; z-index: 50;"
        >
          <view style="width: 40px; height: 40px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 9999px; animation: spin 0.8s linear infinite;" />
        </view>
      </view>

      <!-- Toggle -->
      <view class="text-center">
        <view class="text-muted-foreground text-sm">
          {{ mode === 'login' ? '还没有账号？' : '已有账号？' }}
          <view class="text-primary font-bold inline" @click="toggleMode">
            {{ mode === 'login' ? '去注册' : '去登录' }}
          </view>
        </view>
      </view>

      <!-- Skip -->
      <view class="text-center">
        <view class="text-muted-foreground text-xs" @click="skipLogin">
          暂不登录，直接浏览
        </view>
      </view>
    </view>
  </view>
</template>
