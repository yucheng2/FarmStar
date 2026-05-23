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

  it('loads fields and tracks page view', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    expect(wrapper.text()).toContain('我的田园')
    expect(wrapper.text()).toContain('田地001')
    expect(wrapper.text()).toContain('我的小菜园')
    expect(getAnalyticsEvents()[0]).toMatchObject({ event: 'page_view', pageName: 'garden' })
  })

  it('filters by keyword', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.get('[data-test="search-input"]').setValue('小菜园')
    await wrapper.get('[data-test="search-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('我的小菜园')
    expect(wrapper.text()).not.toContain('田地001')
  })

  it('shows map view unavailable message', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.get('[data-test="map-tab"]').trigger('click')

    expect(wrapper.text()).toContain('地图视图即将开放')
  })

  it('navigates to caretaker selection from idle field', async () => {
    const wrapper = mount(GardenPage)
    await flushPromises()

    await wrapper.findAll('[data-test="field-action"]')[0].trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/caretaker-select/index?field_id=field-001' })
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
