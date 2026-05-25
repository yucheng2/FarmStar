<template>
  <view class="settings-page">
    <!-- Header -->
    <view class="settings-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="page-title">设置</text>
    </view>

    <!-- 个人信息区 -->
    <view class="section">
      <view class="section-title">个人信息</view>
      <!-- 头像行 -->
      <view class="row avatar-row" @click="handleAvatarClick">
        <image class="avatar" src="" @error="handleAvatarError" />
        <text class="avatar-fallback">🌾</text>
      </view>
      <!-- 姓名行 -->
      <view class="row">
        <text class="row-label">姓名</text>
        <input class="row-input" type="text" v-model="name" placeholder="请输入姓名" />
      </view>
      <!-- 电话行 -->
      <view class="row">
        <text class="row-label">电话</text>
        <input class="row-input" type="tel" v-model="phone" placeholder="请输入电话" />
      </view>
      <!-- 村庄行 -->
      <view class="row">
        <text class="row-label">村庄</text>
        <input class="row-input" type="text" v-model="village" placeholder="请输入村庄" />
      </view>
    </view>

    <!-- 通知设置区 -->
    <view class="section">
      <view class="section-title">通知设置</view>
      <!-- 浇水提醒 -->
      <view class="row">
        <text class="row-label">浇水提醒</text>
        <view
          class="toggle"
          :class="{ active: notifications.watering }"
          @click="toggleNotification('watering')"
        ></view>
      </view>
      <!-- 除草提醒 -->
      <view class="row">
        <text class="row-label">除草提醒</text>
        <view
          class="toggle"
          :class="{ active: notifications.weeding }"
          @click="toggleNotification('weeding')"
        ></view>
      </view>
      <!-- 采收提醒 -->
      <view class="row">
        <text class="row-label">采收提醒</text>
        <view
          class="toggle"
          :class="{ active: notifications.harvest }"
          @click="toggleNotification('harvest')"
        ></view>
      </view>
    </view>

    <!-- 账号安全区 -->
    <view class="section">
      <view class="section-title">账号安全</view>
      <view class="btn-row" @click="handleChangePassword">修改密码</view>
    </view>

    <!-- 保存按钮 -->
    <button class="save-btn" @click="handleSave">保存</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getCareTakerInfo } from '../../services/authApi'
import { uni } from '../../utils/uni-mock'

const info = getCareTakerInfo()!
const name = ref(info.name)
const phone = ref(info.phone)
const village = ref(info.village)

const notifications = ref({
  watering: true,
  weeding: true,
  harvest: true
})

function toggleNotification(key: 'watering' | 'weeding' | 'harvest') {
  notifications.value[key] = !notifications.value[key]
}

function goBack() {
  uni.navigateBack()
}

function handleAvatarClick() {
  uni.showToast({ title: '头像功能开发中' })
}

function handleAvatarError(e: any) {
  // Fallback handled by CSS
}

function handleSave() {
  uni.showToast({ title: '保存成功' })
}

function handleChangePassword() {
  uni.showModal({
    title: '修改密码',
    content: '请输入新密码',
    success: () => uni.showToast({ title: '密码已修改' })
  })
}
</script>

<style scoped>
.settings-page {
  min-height: 100dvh;
  background: #F0FDF4;
  padding-bottom: 80px;
}

.settings-header {
  background: #15803D;
  padding: 48px 16px 16px;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
}

.section {
  margin: 16px;
  background: white;
  border-radius: 12px;
}

.section-title {
  font-size: 13px;
  color: #9CA3AF;
  padding: 14px 16px 8px;
}

.row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #F3F4F6;
}

.row:last-child {
  border-bottom: none;
}

.row-label {
  font-size: 15px;
  color: #374151;
  width: 70px;
  flex-shrink: 0;
}

.row-input {
  flex: 1;
  font-size: 15px;
  color: #374151;
  border: none;
  outline: none;
  background: transparent;
  text-align: right;
}

.avatar-row {
  justify-content: center;
  padding: 20px 16px;
  position: relative;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  position: absolute;
  opacity: 0;
}

.avatar-fallback {
  font-size: 48px;
  line-height: 64px;
}

.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #D1D5DB;
  position: relative;
  cursor: pointer;
  transition: background 200ms;
  margin-left: auto;
}

.toggle.active {
  background: #15803D;
}

.toggle::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: left 200ms;
}

.toggle.active::after {
  left: 22px;
}

.btn-row {
  padding: 14px 16px;
  font-size: 15px;
  color: #374151;
  cursor: pointer;
  text-align: center;
}

.save-btn {
  width: calc(100% - 32px);
  margin: 16px;
  padding: 14px;
  background: #15803D;
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
</style>
