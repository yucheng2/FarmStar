import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CaretakerSelectPage from '../../src/pages/caretaker-select/index.vue'
import { caretakers } from '../../src/mocks/gardenData'
import { clearAnalyticsEvents, getAnalyticsEvents } from '../../src/services/analytics'
import { createAdoption, getCaretakers, getRecommendedCaretakers } from '../../src/services/gardenApi'

vi.mock('../../src/services/gardenApi', () => ({
  createAdoption: vi.fn(),
  getCaretakers: vi.fn(),
  getRecommendedCaretakers: vi.fn()
}))

describe('CaretakerSelectPage', () => {
  beforeEach(() => {
    clearAnalyticsEvents()
    vi.mocked(uni.navigateTo).mockClear()
    vi.mocked(uni.showToast).mockClear()
    vi.mocked(createAdoption).mockReset()
    vi.mocked(getCaretakers).mockReset()
    vi.mocked(getRecommendedCaretakers).mockReset()
    vi.mocked(getRecommendedCaretakers).mockResolvedValue({ items: caretakers.slice(0, 3), pagination: {} })
    vi.mocked(getCaretakers).mockResolvedValue({ items: caretakers, pagination: {} })
    vi.mocked(createAdoption).mockResolvedValue({
      adoptionId: 'adoption-field-001-caretaker-zhang',
      status: 'pending_payment',
      paymentOrderId: 'payment-field-001-caretaker-zhang',
      nextUrl: '/pages/payment/confirm?adoption_id=adoption-field-001-caretaker-zhang'
    })
  })

  it('loads recommended and all caretakers', async () => {
    const wrapper = mount(CaretakerSelectPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    expect(wrapper.text()).toContain('系统推荐（3公里内）')
    expect(wrapper.text()).toContain('全部管护员')
    expect(wrapper.text()).toContain('张叔')
    expect(wrapper.text()).toContain('李伯')
  })

  it('selects caretaker and tracks event', async () => {
    const wrapper = mount(CaretakerSelectPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    await wrapper.findAll('.caretaker-card')[0].trigger('click')

    expect(wrapper.text()).toContain('已选择：张叔')
    expect(getAnalyticsEvents()[0]).toMatchObject({ event: 'caretaker_select', caretakerId: 'caretaker-zhang', fieldId: 'field-001' })
  })

  it('keeps confirm disabled until caretaker is selected', async () => {
    const wrapper = mount(CaretakerSelectPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    expect(wrapper.get('[data-test="confirm-selection"]').attributes('disabled')).toBeDefined()
  })

  it('creates adoption and navigates to payment confirmation', async () => {
    const wrapper = mount(CaretakerSelectPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    await wrapper.findAll('.caretaker-card')[0].trigger('click')
    await wrapper.get('[data-test="confirm-selection"]').trigger('click')
    await flushPromises()

    expect(createAdoption).toHaveBeenCalledWith({ fieldId: 'field-001', caretakerId: 'caretaker-zhang' })
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/payment/confirm?adoption_id=adoption-field-001-caretaker-zhang' })
  })
})
