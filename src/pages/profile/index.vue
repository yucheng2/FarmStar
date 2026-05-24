<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NotificationToast from '../../components/NotificationToast.vue'
import { changePassword, getUserProfile, isLoggedIn, logout } from '../../services/authApi'
import { useNotifications } from '../../composables/useNotifications'

const user = ref<{ id: string; username: string; createdAt: string } | null>(null)
const loading = ref(false)
const error = ref('')

const { notifications, dismissNotification, markAsRead, addNotification } = useNotifications()

const showChangePassword = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

async function loadProfile() {
  if (!isLoggedIn()) return
  loading.value = true
  error.value = ''

  try {
    user.value = await getUserProfile()
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : '加载失败'
  } finally {
    loading.value = false
  }
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

function goToAdoptions() {
  uni.navigateTo({ url: '/pages/adoption/index' })
}

async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!currentPassword.value || !newPassword.value) {
    passwordError.value = '请填写完整'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = '两次密码不一致'
    return
  }

  if (newPassword.value.length < 6) {
    passwordError.value = '密码至少6位'
    return
  }

  try {
    await changePassword(currentPassword.value, newPassword.value)
    passwordSuccess.value = '密码修改成功'
    addNotification({
      title: '密码修改成功',
      message: '您的登录密码已更新，请使用新密码登录',
      type: 'success'
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => {
      showChangePassword.value = false
      passwordSuccess.value = ''
    }, 1500)
  } catch (caughtError) {
    passwordError.value = caughtError instanceof Error ? caughtError.message : '修改失败'
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <NotificationToast
    :notifications="notifications"
    @dismiss="dismissNotification"
    @mark-read="markAsRead"
  />
  <view class="min-h-dvh bg-background pb-6">
    <!-- Header -->
    <view style="display: flex; align-items: center; justify-content: space-between; margin: 0 16px; padding: 14px 0;">
      <view class="text-primary text-sm" style="width: 60px;" @click="uni.navigateBack()">←</view>
      <view class="text-foreground text-lg font-bold">个人中心</view>
      <view style="width: 60px;" />
    </view>

    <!-- Not logged in -->
    <view v-if="!isLoggedIn()" class="card" style="margin: 16px;">
      <view class="text-foreground text-lg font-bold">未登录</view>
      <view class="text-muted-foreground text-sm" style="margin-top: 4px;">登录后可以查看认养记录和个人信息。</view>
      <button class="btn-primary w-full h-11 mt-3" @click="goToLogin">
        去登录
      </button>
    </view>

    <!-- Loading -->
    <view v-else-if="loading" style="margin: 40px 16px; text-align: center; color: var(--color-muted-foreground);">
      加载中...
    </view>

    <!-- Error -->
    <view v-else-if="error" class="card" style="margin: 16px;">
      <view class="text-foreground text-lg font-bold">加载失败</view>
      <view class="text-muted-foreground text-sm">{{ error }}</view>
      <button class="btn-primary w-full h-11 mt-3" @click="loadProfile">
        重试
      </button>
    </view>

    <!-- Profile -->
    <view v-else-if="user" style="display: flex; flex-direction: column; gap: 12px; margin: 0 16px;">
      <!-- User Card -->
      <view class="card" style="display: flex; align-items: center; gap: 16px;">
        <view
          style="width: 64px; height: 64px; border-radius: 9999px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 700;"
        >
          {{ user.username.charAt(0).toUpperCase() }}
        </view>
        <view style="display: flex; flex-direction: column; gap: 4px;">
          <view class="text-foreground text-lg font-bold">{{ user.username }}</view>
          <view class="text-muted-foreground text-sm">注册时间：{{ new Date(user.createdAt).toLocaleDateString('zh-CN') }}</view>
        </view>
      </view>

      <!-- Menu -->
      <view class="card" style="display: flex; flex-direction: column; gap: 2px;">
        <view
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--color-border); cursor: pointer;"
          @click="goToAdoptions"
        >
          <view class="text-foreground text-sm">我的认养</view>
          <view class="text-muted-foreground text-sm">→</view>
        </view>
        <view
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--color-border); cursor: pointer;"
          @click="showChangePassword = true"
        >
          <view class="text-foreground text-sm">修改密码</view>
          <view class="text-muted-foreground text-sm">→</view>
        </view>
        <view
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; cursor: pointer;"
          @click="handleLogout"
        >
          <view class="text-destructive text-sm">退出登录</view>
          <view class="text-muted-foreground text-sm">→</view>
        </view>
      </view>
    </view>

    <!-- Change Password Modal -->
    <view
      v-if="showChangePassword"
      style="position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0, 0, 0, 0.4);"
    >
      <view class="card" style="width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 12px;">
        <view class="text-foreground text-lg font-bold">修改密码</view>

        <view class="flex flex-col gap-1">
          <view class="text-foreground text-sm font-bold">当前密码</view>
          <input
            v-model="currentPassword"
            class="input-field"
            style="height: 44px;"
            type="password"
            placeholder="请输入当前密码"
          />
        </view>

        <view class="flex flex-col gap-1">
          <view class="text-foreground text-sm font-bold">新密码</view>
          <input
            v-model="newPassword"
            class="input-field"
            style="height: 44px;"
            type="password"
            placeholder="请输入新密码"
          />
        </view>

        <view class="flex flex-col gap-1">
          <view class="text-foreground text-sm font-bold">确认新密码</view>
          <input
            v-model="confirmPassword"
            class="input-field"
            style="height: 44px;"
            type="password"
            placeholder="请再次输入新密码"
          />
        </view>

        <view v-if="passwordError" class="text-destructive text-sm">{{ passwordError }}</view>
        <view v-if="passwordSuccess" class="text-primary text-sm">{{ passwordSuccess }}</view>

        <view style="display: flex; gap: 8px; margin-top: 4px;">
          <button class="btn-secondary w-full h-11" @click="showChangePassword = false">
            取消
          </button>
          <button class="btn-primary w-full h-11" @click="handleChangePassword">
            确认修改
          </button>
        </view>
      </view>
    </view>
  </view>
</template>
