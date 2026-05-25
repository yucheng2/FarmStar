<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { isLoggedIn } from './services/authApi'
import LoginPage from './pages/caretaker-login/index.vue'
import HomePage from './pages/caretaker-home/index.vue'
import MapPage from './pages/caretaker-map/index.vue'
import ScanPage from './pages/caretaker-scan/index.vue'
import ProfilePage from './pages/caretaker-profile/index.vue'
import FieldPage from './pages/caretaker-field/index.vue'
import CareLogPage from './pages/caretaker-care-log/index.vue'
import StatsPage from './pages/caretaker-stats/index.vue'
import SettingsPage from './pages/caretaker-settings/index.vue'
import HelpPage from './pages/caretaker-help/index.vue'

// Simple client-side routing
const route = ref(window.location.pathname)
const isAuth = ref(isLoggedIn())

// Parse initial route
function getInitialPage() {
  const path = window.location.pathname
  if (path.includes('home')) return 'home'
  if (path.includes('map')) return 'map'
  if (path.includes('scan')) return 'scan'
  if (path.includes('profile')) return 'profile'
  if (path.includes('field')) return 'field'
  if (path.includes('care-log')) return 'care-log'
  if (path.includes('stats')) return 'stats'
  if (path.includes('settings')) return 'settings'
  if (path.includes('help')) return 'help'
  return isAuth.value ? 'home' : 'login'
}

const currentPage = ref(getInitialPage())

// Listen for popstate (back/forward navigation)
window.addEventListener('popstate', () => {
  route.value = window.location.pathname
  currentPage.value = getInitialPage()
})

// Navigate function (call this to change pages)
function navigateTo(page: string) {
  currentPage.value = page
  window.history.pushState({}, '', `/${page}`)
}

// Expose navigate globally for page components
;(window as any).navigateTo = navigateTo
</script>

<template>
  <view class="min-h-dvh bg-background">
    <LoginPage v-if="currentPage === 'login'" />
    <HomePage v-else-if="currentPage === 'home'" />
    <MapPage v-else-if="currentPage === 'map'" />
    <ScanPage v-else-if="currentPage === 'scan'" />
    <ProfilePage v-else-if="currentPage === 'profile'" />
    <FieldPage v-else-if="currentPage === 'field'" />
    <CareLogPage v-else-if="currentPage === 'care-log'" />
    <StatsPage v-else-if="currentPage === 'stats'" />
    <SettingsPage v-else-if="currentPage === 'settings'" />
    <HelpPage v-else-if="currentPage === 'help'" />
    <LoginPage v-else />
  </view>
</template>
