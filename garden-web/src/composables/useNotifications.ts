import { ref } from 'vue'
import type { Notification } from '../components/NotificationToast.vue'

let globalIdCounter = 0

export function useNotifications() {
  const notifications = ref<Notification[]>([])
  let idCounter = 0

  function addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const id = `notif-${++globalIdCounter}-${++idCounter}-${Date.now()}`
    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date().toISOString()
    }
    notifications.value.unshift(newNotification)

    // Auto-dismiss after 5 seconds for non-warning types
    if (notification.type !== 'warning') {
      setTimeout(() => {
        dismissNotification(id)
      }, 5000)
    }

    return id
  }

  function dismissNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function clearAll() {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    markAsRead,
    clearAll
  }
}
