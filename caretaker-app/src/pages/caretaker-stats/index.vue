<template>
  <view class="stats-page">
    <!-- Header -->
    <view class="stats-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="page-title">养护统计</text>
    </view>

    <!-- 数据统计区 -->
    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-num stat-num-green">{{ stats.weeklyCount }}</text>
        <text class="stat-label">本周养护次数</text>
      </view>
      <view class="stat-card">
        <text class="stat-num stat-num-green">{{ stats.monthlyCount }}</text>
        <text class="stat-label">本月养护次数</text>
      </view>
      <view class="stat-card">
        <text class="stat-num stat-num-green">{{ stats.fieldCount }}</text>
        <text class="stat-label">负责田地数</text>
      </view>
      <view class="stat-card">
        <text class="stat-num stat-num-green">{{ stats.completedCount }}</text>
        <text class="stat-label">完成任务数</text>
      </view>
    </view>

    <!-- 认养数据区 -->
    <view class="adoption-grid">
      <view class="stat-card">
        <text class="stat-num stat-num-orange">{{ adoptionStats.userCount }}</text>
        <text class="stat-label">认养用户数</text>
      </view>
      <view class="stat-card">
        <text class="stat-num stat-num-orange">¥{{ adoptionStats.totalIncome }}</text>
        <text class="stat-label">认养总收入</text>
      </view>
      <view class="stat-card">
        <text class="stat-num stat-num-green">{{ adoptionStats.careDays }}天</text>
        <text class="stat-label">累计养护天数</text>
      </view>
    </view>

    <!-- 养护记录列表 -->
    <view class="care-log-list">
      <view
        v-for="(log, index) in careLogList"
        :key="index"
        class="care-log-item"
        @click="goToField(log.fieldId)"
      >
        <text class="log-emoji">{{ log.emoji }}</text>
        <view class="log-info">
          <text class="log-field-name">{{ log.fieldName }}</text>
          <text class="log-action">{{ log.caretakerName }} · {{ log.action }}</text>
        </view>
        <text class="log-time">{{ formatDate(log.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { uni } from '../../utils/uni-mock'

const stats = { weeklyCount: 12, monthlyCount: 45, fieldCount: 8, completedCount: 38 }
const adoptionStats = { userCount: 24, totalIncome: 3600, careDays: 180 }
const careLogList = [
  { fieldId: 'field-002', fieldName: '我的小菜园', action: '浇水', emoji: '🌱', caretakerName: '李伯', createdAt: new Date().toISOString() },
  { fieldId: 'field-006', fieldName: '北山苹果园', action: '巡检', emoji: '🔍', caretakerName: '吴伯', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { fieldId: 'field-008', fieldName: '青禾村水稻田', action: '水位检查', emoji: '🔬', caretakerName: '张叔', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { fieldId: 'field-002', fieldName: '我的小菜园', action: '除草', emoji: '🌿', caretakerName: '李伯', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  return `${diff}天前`
}

function goBack() { uni.navigateBack() }
function goToField(fieldId: string) { uni.navigateTo({ url: `/pages/caretaker-field/index?field_id=${fieldId}` }) }
</script>

<style scoped>
.stats-page {
  min-height: 100dvh;
  background-color: #F0FDF4;
  padding-bottom: 80px;
}

.stats-header {
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

.stats-grid {
  display: flex;
  gap: 8px;
  padding: 16px;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
}

.stat-num-green {
  color: #15803D;
}

.stat-num-orange {
  color: #D97706;
}

.stat-label {
  font-size: 12px;
  color: #9CA3AF;
}

.adoption-grid {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
}

.care-log-list {
  margin: 0 16px 16px;
  background: white;
  border-radius: 12px;
}

.care-log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
}

.care-log-item:last-child {
  border-bottom: none;
}

.log-emoji {
  font-size: 20px;
}

.log-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-field-name {
  font-size: 14px;
  font-weight: 600;
  color: #14532D;
}

.log-action {
  font-size: 12px;
  color: #6B766B;
}

.log-time {
  font-size: 12px;
  color: #9CA3AF;
}
</style>
