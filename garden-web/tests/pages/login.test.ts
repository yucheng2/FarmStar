import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '../../src/pages/login/index.vue'
import { login, register } from '../../src/services/authApi'

vi.mock('../../src/services/authApi', () => ({
  login: vi.fn(),
  register: vi.fn()
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form by default', () => {
    const wrapper = mount(LoginPage)

    expect(wrapper.text()).toContain('FarmStar')
    expect(wrapper.text()).toContain('登录你的账号')
    expect(wrapper.text()).toContain('用户名')
    expect(wrapper.text()).toContain('密码')
    expect(wrapper.text()).toContain('登录')
  })

  it('toggles to register mode', async () => {
    const wrapper = mount(LoginPage)

    await wrapper.find('.text-primary.font-bold.inline').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('创建新账号')
    expect(wrapper.text()).toContain('确认密码')
    expect(wrapper.text()).toContain('注册')
  })

  it('shows error when fields are empty', async () => {
    const wrapper = mount(LoginPage)

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('请填写用户名和密码')
  })

  it('logs in successfully', async () => {
    vi.mocked(login).mockResolvedValueOnce({
      user: { id: 'user-1', username: 'test', createdAt: '2026-05-24' },
      token: 'test-token'
    })

    const wrapper = mount(LoginPage)

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('test')
    await inputs[1].setValue('123456')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(login).toHaveBeenCalledWith('test', '123456')
    expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/garden/index' })
  })

  it('registers successfully', async () => {
    vi.mocked(register).mockResolvedValueOnce({
      user: { id: 'user-1', username: 'newuser', createdAt: '2026-05-24' },
      token: 'test-token'
    })

    const wrapper = mount(LoginPage)

    // Toggle to register mode
    await wrapper.find('.text-primary.font-bold.inline').trigger('click')
    await flushPromises()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('newuser')
    await inputs[1].setValue('123456')
    await inputs[2].setValue('123456')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(register).toHaveBeenCalledWith('newuser', '123456')
    expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/garden/index' })
  })

  it('shows error when passwords do not match', async () => {
    const wrapper = mount(LoginPage)

    // Toggle to register mode
    await wrapper.find('.text-primary.font-bold.inline').trigger('click')
    await flushPromises()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('newuser')
    await inputs[1].setValue('123456')
    await inputs[2].setValue('654321')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('两次密码不一致')
    expect(register).not.toHaveBeenCalled()
  })

  it('shows error on login failure', async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error('用户名或密码错误'))

    const wrapper = mount(LoginPage)

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('test')
    await inputs[1].setValue('wrong')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('用户名或密码错误')
  })

  it('allows skipping login', async () => {
    const wrapper = mount(LoginPage)

    // Find the skip text and click it
    const skipText = wrapper.findAll('.text-muted-foreground').find(el => el.text() === '暂不登录，直接浏览')
    expect(skipText).toBeTruthy()
    await skipText!.trigger('click')
    await flushPromises()

    expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/garden/index' })
  })
})
