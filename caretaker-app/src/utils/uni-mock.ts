// Uniapp API mock for web development using real localStorage

export const uni = {
  // Storage - using real localStorage
  getStorageSync: (key: string): string => {
    return localStorage.getItem(key) || ''
  },
  setStorageSync: (key: string, value: string): void => {
    localStorage.setItem(key, value)
  },
  removeStorageSync: (key: string): void => {
    localStorage.removeItem(key)
  },

  // Navigation - update URL and dispatch event
  navigateTo: (options: { url: string }) => {
    window.history.pushState({}, '', options.url)
    window.dispatchEvent(new PopStateEvent('popstate'))
  },
  switchTab: (options: { url: string }) => {
    window.history.pushState({}, '', options.url)
    window.dispatchEvent(new PopStateEvent('popstate'))
  },
  reLaunch: (options: { url: string }) => {
    window.history.pushState({}, '', options.url)
    window.dispatchEvent(new PopStateEvent('popstate'))
  },
  navigateBack: () => {
    window.history.back()
  },

  // Toast
  showToast: (options: { title: string; icon?: string; duration?: number }) => {
    alert(options.title)
  },

  // Modal
  showModal: (options: {
    title: string
    content: string
    success?: (res: { confirm: boolean }) => void
  }) => {
    if (options.success) {
      options.success({ confirm: true })
    }
  },

  // App Route
  onAppRoute: (callback: (res: any) => void) => {
    window.addEventListener('popstate', () => {
      callback({ route: window.location.pathname })
    })
  },

  // Get current pages
  getCurrentPages: () => {
    return [{ route: window.location.pathname }]
  },

  // Clipboard
  setClipboardData: (options: { data: string; success?: () => void }) => {
    navigator.clipboard.writeText(options.data).then(() => {
      options.success?.()
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = options.data
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      options.success?.()
    })
  }
}

export default uni
