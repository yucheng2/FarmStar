import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotifications } from '../../src/composables/useNotifications'

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds a notification', () => {
    const { notifications, addNotification } = useNotifications()

    const id = addNotification({
      title: '测试通知',
      message: '这是一条测试消息',
      type: 'info'
    })

    expect(notifications.value).toHaveLength(1)
    expect(notifications.value[0]).toMatchObject({
      title: '测试通知',
      message: '这是一条测试消息',
      type: 'info',
      read: false
    })
    expect(notifications.value[0].id).toBe(id)
    expect(notifications.value[0].createdAt).toBeDefined()
  })

  it('auto-dismisses non-warning notifications after 5 seconds', () => {
    const { notifications, addNotification } = useNotifications()

    addNotification({
      title: '自动关闭',
      message: '5秒后关闭',
      type: 'success'
    })

    expect(notifications.value).toHaveLength(1)

    vi.advanceTimersByTime(5000)

    expect(notifications.value).toHaveLength(0)
  })

  it('does not auto-dismiss warning notifications', () => {
    const { notifications, addNotification } = useNotifications()

    addNotification({
      title: '警告通知',
      message: '不会自动关闭',
      type: 'warning'
    })

    vi.advanceTimersByTime(5000)

    expect(notifications.value).toHaveLength(1)
  })

  it('dismisses a notification by id', () => {
    const { notifications, addNotification, dismissNotification } = useNotifications()

    const id = addNotification({
      title: '待关闭',
      message: '手动关闭',
      type: 'info'
    })

    expect(notifications.value).toHaveLength(1)

    dismissNotification(id)

    expect(notifications.value).toHaveLength(0)
  })

  it('marks a notification as read', () => {
    const { notifications, addNotification, markAsRead } = useNotifications()

    const id = addNotification({
      title: '已读测试',
      message: '标记为已读',
      type: 'info'
    })

    markAsRead(id)

    expect(notifications.value[0].read).toBe(true)
  })

  it('clears all notifications', () => {
    const { notifications, addNotification, clearAll } = useNotifications()

    addNotification({ title: '通知1', message: '消息1', type: 'info' })
    addNotification({ title: '通知2', message: '消息2', type: 'success' })

    expect(notifications.value).toHaveLength(2)

    clearAll()

    expect(notifications.value).toHaveLength(0)
  })
})
