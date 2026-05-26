import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from '../../src/pages/profile/index.vue'
import { isLoggedIn } from '../../src/services/authApi'

vi.mock('../../src/services/authApi', () => ({
  changePassword: vi.fn(),
  getUserProfile: vi.fn(),
  isLoggedIn: vi.fn(() => false),
  logout: vi.fn()
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.mocked(isLoggedIn).mockReturnValue(false)
  })

  it('does not render an in-page navigation header', async () => {
    const wrapper = mount(ProfilePage)
    await flushPromises()

    expect(wrapper.findAll('view').some((node) => node.text() === '←个人中心')).toBe(false)
  })

  it('shows login prompt when signed out', async () => {
    const wrapper = mount(ProfilePage)
    await flushPromises()

    expect(wrapper.text()).toContain('未登录')
    expect(wrapper.text()).toContain('登录后可以查看认养记录和个人信息。')
  })
})
