<template>
  <view class="help-page">
    <!-- Header -->
    <view class="help-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="page-title">帮助与反馈</text>
    </view>

    <!-- FAQ Section -->
    <view class="section">
      <view class="section-title">常见问题</view>
      <view v-for="(faq, index) in faqs" :key="index" class="faq-item">
        <view class="faq-q" @click="toggleFaq(index)">
          <text>{{ faq.q }}</text>
          <text class="faq-arrow">{{ expandedFaq === index ? '∧' : '›' }}</text>
        </view>
        <view class="faq-a" v-show="expandedFaq === index">
          <text>{{ faq.a }}</text>
        </view>
      </view>
    </view>

    <!-- Feedback Section -->
    <view class="section">
      <view class="section-title">提交反馈</view>
      <view class="feedback-form">
        <textarea
          class="feedback-textarea"
          placeholder="请描述您的问题"
          v-model="feedbackText"
          maxlength="200"
        ></textarea>
        <input
          class="feedback-input"
          type="text"
          placeholder="请输入手机号（选填）"
          v-model="feedbackPhone"
        />
        <button class="feedback-submit" @click="submitFeedback">提交反馈</button>
      </view>
    </view>

    <!-- Contact Section -->
    <view class="section">
      <view class="section-title">联系我们</view>
      <view class="contact-item" @click="copyText('400-XXX-XXXX')">
        <text>客服热线</text>
        <text>400-XXX-XXXX</text>
      </view>
      <view class="contact-item" @click="copyText('FarmStar')">
        <text>微信公众号</text>
        <text>FarmStar</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uni } from '../../utils/uni-mock'

const expandedFaq = ref(-1)
const feedbackText = ref('')
const feedbackPhone = ref('')

const faqs = [
  { q: '如何认养田地？', a: '在首页点击田地卡片，选择认养即可。' },
  { q: '忘记密码怎么办？', a: '联系客服重置密码，电话 400-XXX-XXXX。' },
  { q: '如何联系客服？', a: '微信搜索 FarmStar 或拨打 400-XXX-XXXX。' },
  { q: '认养费用如何计算？', a: '根据田地面积和作物类型，每平米每月 X 元。' },
  { q: '养护记录如何查看？', a: '进入田地详情页，点击养护记录tab查看。' },
]

function toggleFaq(index: number) {
  expandedFaq.value = expandedFaq.value === index ? -1 : index
}

function submitFeedback() {
  if (!feedbackText.value.trim()) {
    uni.showToast({ title: '请输入反馈内容' })
    return
  }
  uni.showToast({ title: '反馈已提交' })
  feedbackText.value = ''
  feedbackPhone.value = ''
}

function copyText(text: string) {
  uni.setClipboardData({ data: text, success: () => uni.showToast({ title: '已复制' }) })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.help-page {
  min-height: 100dvh;
  background: #F0FDF4;
  padding-bottom: 80px;
}
.help-header {
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
.faq-item {
  border-bottom: 1px solid #F3F4F6;
}
.faq-item:last-child {
  border-bottom: none;
}
.faq-q {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  font-size: 15px;
  cursor: pointer;
}
.faq-arrow {
  font-size: 16px;
  color: #9CA3AF;
  transition: transform 200ms;
}
.faq-a {
  padding: 0 16px 14px;
  font-size: 14px;
  color: #6B766B;
  line-height: 1.6;
}
.feedback-form {
  padding: 0 16px 16px;
}
.feedback-textarea {
  width: 100%;
  min-height: 100px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
  outline: none;
}
.feedback-textarea:focus {
  border-color: #15803D;
}
.feedback-input {
  width: 100%;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  margin-top: 12px;
}
.feedback-input:focus {
  border-color: #15803D;
}
.feedback-submit {
  width: 100%;
  padding: 14px;
  background: #15803D;
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-top: 12px;
}
.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
}
</style>
