<script setup lang="ts">
import { ref } from 'vue'
import BottomNav from '../../components/BottomNav.vue'
import { uni } from '../../utils/uni-mock'

const scanning = ref(false)
const error = ref('')
const activeTab = ref<'home' | 'map' | 'scan' | 'profile'>('scan')

function handleBack() {
  uni.navigateBack()
}

function handleNav(tab: 'home' | 'map' | 'scan' | 'profile') {
  activeTab.value = tab
  if (tab === 'home') {
    uni.switchTab({ url: '/pages/caretaker-home/index' })
  } else if (tab === 'map') {
    uni.switchTab({ url: '/pages/caretaker-map/index' })
  } else if (tab === 'profile') {
    uni.switchTab({ url: '/pages/caretaker-profile/index' })
  }
}

async function handleScan() {
  scanning.value = true
  error.value = ''

  try {
    // 模拟扫码结果
    const mockResult = {
      errMsg: 'scanCode:ok',
      result: 'field-002'
    }

    if (mockResult.result) {
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
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="handleBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">扫描田地</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 扫描区域 -->
    <view class="scan-area">
      <!-- 扫描框 -->
      <view class="scan-frame">
        <view class="corner corner-tl" />
        <view class="corner corner-tr" />
        <view class="corner corner-bl" />
        <view class="corner corner-br" />
        <view class="scan-line" />
      </view>

      <view class="scan-tip">
        <text class="tip-title">扫描田地二维码</text>
        <text class="tip-desc">将田地二维码放入框内即可自动扫描</text>
      </view>

      <view v-if="error" class="error-msg">
        <text>{{ error }}</text>
      </view>
    </view>

    <!-- 扫描按钮 -->
    <view class="scan-action">
      <button class="btn-scan" :disabled="scanning" @click="handleScan">
        {{ scanning ? '扫描中...' : '开始扫码' }}
      </button>
      <text class="scan-hint">测试：点击按钮模拟扫描 field-002</text>
    </view>

    <!-- 底部导航 -->
    <BottomNav :active="activeTab" @navigate="handleNav" />
  </view>
</template>

<style>
/* 页面容器 */
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: var(--color-background, #F0FDF4);
  padding-bottom: 80px;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 16px 16px;
  background-color: var(--color-primary, #15803D);
  color: white;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.back-icon {
  font-size: 24px;
  font-weight: 600;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
}

.nav-placeholder {
  width: 40px;
}

/* 扫描区域 */
.scan-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 48px 0 24px;
}

.scan-frame {
  position: relative;
  width: 220px;
  height: 220px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 16px;
}

/* 四个角落 */
.corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: var(--color-primary, #15803D);
  border-style: solid;
}

.corner-tl {
  top: 0;
  left: 0;
  border-width: 4px 0 0 4px;
  border-radius: 12px 0 0 0;
}

.corner-tr {
  top: 0;
  right: 0;
  border-width: 4px 4px 0 0;
  border-radius: 0 12px 0 0;
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-width: 0 0 4px 4px;
  border-radius: 0 0 0 12px;
}

.corner-br {
  bottom: 0;
  right: 0;
  border-width: 0 4px 4px 0;
  border-radius: 0 0 12px 0;
}

.scan-line {
  position: absolute;
  left: 16px;
  right: 16px;
  height: 2px;
  background-color: var(--color-primary, #15803D);
  top: 50%;
  animation: scan 2s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% { top: 20%; opacity: 0.5; }
  50% { top: 80%; opacity: 1; }
}

.scan-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
  gap: 8px;
}

.tip-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-foreground, #14532D);
}

.tip-desc {
  font-size: 14px;
  color: var(--color-muted-foreground, #6B766B);
}

.error-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #FEF2F2;
  border-radius: 8px;
  color: #EF4444;
  font-size: 14px;
}

/* 扫描按钮 */
.scan-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 24px;
  gap: 12px;
}

.btn-scan {
  width: 100%;
  padding: 16px;
  background-color: var(--color-primary, #15803D);
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
}

.btn-scan:disabled {
  opacity: 0.6;
}

.scan-hint {
  font-size: 12px;
  color: var(--color-muted-foreground, #6B766B);
}
</style>
