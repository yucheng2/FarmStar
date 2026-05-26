import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GardenPage from '../../src/pages/garden/index.vue'
import { fields } from '../../src/mocks/gardenData'
import { clearAnalyticsEvents, getAnalyticsEvents } from '../../src/services/analytics'
import { getCaretakerById, getFields } from '../../src/services/gardenApi'

vi.mock('../../src/services/gardenApi', () => ({
  getFields: vi.fn(),
  getCaretakerById: vi.fn()
}))

vi.mock('../../src/services/authApi', () => ({
  isLoggedIn: vi.fn(() => true),
  logout: vi.fn()
}))

describe('GardenPage', () => {
  beforeEach(() => {
    clearAnalyticsEvents()
    vi.mocked(uni.navigateTo).mockClear()
    vi.mocked(uni.showToast).mockClear()
    vi.mocked(getFields).mockReset()
    vi.mocked(getCaretakerById).mockReset()
    vi.mocked(getFields).mockImplementation(async (filters = {}) => ({
      items: fields.filter((field) => {
        if (filters.status && field.status !== filters.status) return false
        if (filters.keyword && !field.name.includes(filters.keyword) && !field.code.includes(filters.keyword)) return false
        return true
      }),
      pagination: {}
    }))
    vi.mocked(getCaretakerById).mockResolvedValue(fields[0].caretaker as never)
  })

  it('loads all fields by default and tracks page view', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    expect(getFields).toHaveBeenCalledWith({})
    expect(wrapper.get('[data-test="search-input"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('青禾村东头菜地')
    expect(wrapper.text()).toContain('我的小菜园')
    expect(getAnalyticsEvents()[0]).toMatchObject({ event: 'page_view', pageName: 'garden' })
  })

  it('does not render an in-page navigation header', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    expect(wrapper.findAll('view').some((node) => node.text().startsWith('←我的田园'))).toBe(false)
  })

  it('renders search action as an icon button', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    expect(wrapper.get('[data-test="search-button"]').text()).toBe('')
    expect(wrapper.get('[data-test="search-button"]').attributes('aria-label')).toBe('搜索')
    expect(wrapper.get('[data-test="search-icon"]').element.tagName.toLowerCase()).toBe('svg')
  })

  it('filters by keyword', async () => {
    vi.useFakeTimers()
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.get('[data-test="search-input"]').setValue('小菜园')
    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()

    expect(getFields).toHaveBeenLastCalledWith({ keyword: '小菜园' })
    expect(wrapper.text()).toContain('我的小菜园')
    vi.useRealTimers()
  })

  it('keeps filter chips rounded in active and inactive states', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    const allFieldsChip = wrapper.findAll('button').find((button) => button.text() === '全部田地')
    const idleChip = wrapper.findAll('button').find((button) => button.text() === '可认养')

    // Default selectedStatus is '', so 全部田地 is active (primary color) and 可认养 is inactive
    expect(allFieldsChip?.classes()).toContain('bg-[var(--color-primary)]')
    expect(allFieldsChip?.classes()).toContain('text-[var(--color-primary-foreground)]')
    expect(idleChip?.classes()).toContain('bg-[var(--color-card)]')
    expect(idleChip?.classes()).toContain('text-[var(--color-muted-foreground)]')
  })

  it('shows map view with field markers', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.get('[data-test="map-tab"]').trigger('click')

    expect(wrapper.text()).toContain('可认养')
    expect(wrapper.text()).toContain('已认养')
  })

  it('opens profile entry', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.get('[data-test="profile-entry"]').trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/profile/index' })
  })

  it('navigates to caretaker selection from idle field', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('[data-test="field-action"]')[0].trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/caretaker-select/index?field_id=field-001' })
  })

  it('opens adopted field detail', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === '已被认养')?.trigger('click')
    await flushPromises()
    await wrapper.findAll('[data-test="field-action"]')[0].trigger('click')

    expect(wrapper.get('[data-test="field-detail-modal"]').text()).toContain('我的小菜园')
    expect(wrapper.get('[data-test="field-detail-modal"]').text()).toContain('状态：已认养')
    expect(wrapper.get('[data-test="field-detail-modal"]').text()).toContain('管护员')
    expect(wrapper.get('[data-test="field-detail-modal"]').text()).toContain('查看认养状态')
    expect(uni.showToast).not.toHaveBeenCalled()
  })

  it('opens adoption detail from adopted field detail', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === '已被认养')?.trigger('click')
    await flushPromises()
    await wrapper.findAll('[data-test="field-action"]')[0].trigger('click')
    await wrapper.get('[data-test="view-field-adoption"]').trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/adoption/detail?adoption_id=adoption-field-002-caretaker-li' })
  })

  it('opens field monitoring from adopted field detail', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === '已被认养')?.trigger('click')
    await flushPromises()
    await wrapper.findAll('[data-test="field-action"]')[0].trigger('click')
    await wrapper.get('[data-test="view-field-monitoring"]').trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/field-monitoring/index?field_id=field-002' })
  })

  it('closes adopted field detail', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === '已被认养')?.trigger('click')
    await flushPromises()
    await wrapper.findAll('[data-test="field-action"]')[0].trigger('click')
    await wrapper.get('[data-test="close-field-detail"]').trigger('click')

    expect(wrapper.find('[data-test="field-detail-modal"]').exists()).toBe(false)
  })

  it('opens caretaker modal and tracks click/detail view', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('[data-test="caretaker-avatar"]')[0].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('18年管护经验')
    expect(getAnalyticsEvents().map((event) => event.event)).toContain('caretaker_click')
    expect(getAnalyticsEvents().map((event) => event.event)).toContain('caretaker_detail_view')
  })
})
