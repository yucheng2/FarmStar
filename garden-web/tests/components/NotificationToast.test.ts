import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NotificationToast from '../../src/components/NotificationToast.vue'

describe('NotificationToast', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      title: '成功通知',
      message: '操作成功完成',
      type: 'success' as const,
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-2',
      title: '警告通知',
      message: '请注意检查',
      type: 'warning' as const,
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-3',
      title: '信息通知',
      message: '有新的消息',
      type: 'info' as const,
      read: false,
      createdAt: new Date().toISOString()
    }
  ]

  it('renders notifications', () => {
    const wrapper = mount(NotificationToast, {
      props: { notifications: mockNotifications }
    })

    expect(wrapper.text()).toContain('成功通知')
    expect(wrapper.text()).toContain('警告通知')
    expect(wrapper.text()).toContain('信息通知')
  })

  it('emits dismiss event', async () => {
    const wrapper = mount(NotificationToast, {
      props: { notifications: mockNotifications }
    })

    wrapper.vm.$emit('dismiss', 'notif-1')

    expect(wrapper.emitted('dismiss')).toBeTruthy()
    expect(wrapper.emitted('dismiss')![0]).toEqual(['notif-1'])
  })

  it('emits markRead event', async () => {
    const wrapper = mount(NotificationToast, {
      props: { notifications: mockNotifications }
    })

    wrapper.vm.$emit('markRead', 'notif-1')

    expect(wrapper.emitted('markRead')).toBeTruthy()
    expect(wrapper.emitted('markRead')![0]).toEqual(['notif-1'])
  })

  it('does not render when no notifications', () => {
    const wrapper = mount(NotificationToast, {
      props: { notifications: [] }
    })

    expect(wrapper.text()).toBe('')
  })

  it('does not render when all notifications are read', () => {
    const wrapper = mount(NotificationToast, {
      props: {
        notifications: mockNotifications.map(n => ({ ...n, read: true }))
      }
    })

    expect(wrapper.text()).toBe('')
  })
})
