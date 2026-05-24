import { ref } from 'vue'
import { isLoggedIn, getCareTakerInfo, logout as authLogout, type CaretakerUser } from '../services/authApi'

const caretakerInfo = ref<CaretakerUser | null>(getCareTakerInfo())
const loggedIn = ref(isLoggedIn())

function updateAuth() {
  caretakerInfo.value = getCareTakerInfo()
  loggedIn.value = isLoggedIn()
}

function logout() {
  authLogout()
  updateAuth()
}

export function useCareTakerAuth() {
  return {
    caretakerInfo,
    loggedIn,
    logout,
    updateAuth
  }
}