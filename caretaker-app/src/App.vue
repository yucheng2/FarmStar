<script setup lang="ts">
import { onMounted } from 'vue'
import { checkAuth } from './middleware/authGuard'

onMounted(() => {
  // Simple routing simulation - in real uniapp this would be handled by the framework
  const currentPath = '/pages/caretaker-login/index'
  const redirect = checkAuth(currentPath)
  if (redirect) {
    // Would handle navigation in real app
    console.log('Redirect to:', redirect)
  }
})
</script>

<template>
  <view class="min-h-dvh bg-background">
    <RouterView />
  </view>
</template>
