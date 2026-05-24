import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PaymentConfirmPage from '../../src/pages/payment/confirm.vue'
import { caretakers, fields } from '../../src/mocks/gardenData'
import { getAdoptionById, getCaretakerById, getFieldById } from '../../src/services/gardenApi'

vi.mock('../../src/services/gardenApi', () => ({
  getAdoptionById: vi.fn(),
  getFieldById: vi.fn(),
  getCaretakerById: vi.fn()
}))

describe('PaymentConfirmPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(uni.navigateTo).mockClear()
    vi.mocked(getAdoptionById).mockReset()
    vi.mocked(getFieldById).mockReset()
    vi.mocked(getCaretakerById).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders payment confirm with field and caretaker info', async () => {
    vi.mocked(getAdoptionById).mockResolvedValueOnce({
      id: 'adoption-field-001-caretaker-zhang',
      userId: 'user-demo',
      fieldId: 'field-001',
      caretakerId: 'caretaker-zhang',
      status: 'pending_payment',
      paymentOrderId: 'payment-field-001-caretaker-zhang',
      createdAt: '2026-05-23T10:00:00+08:00'
    })
    vi.mocked(getFieldById).mockResolvedValueOnce(fields[0])
    vi.mocked(getCaretakerById).mockResolvedValueOnce(caretakers[0])

    const wrapper = mount(PaymentConfirmPage, { props: { adoptionId: 'adoption-field-001-caretaker-zhang' } })
    await flushPromises()

    expect(getAdoptionById).toHaveBeenCalledWith('adoption-field-001-caretaker-zhang')
    expect(wrapper.text()).toContain('确认认养')
    expect(wrapper.text()).toContain('田地信息')
    expect(wrapper.text()).toContain('管护员信息')
    expect(wrapper.text()).toContain('支付信息')
    expect(wrapper.text()).toContain('张叔')
    expect(wrapper.text()).toContain('田地001')
  })

  it('handles payment confirmation and shows success', async () => {
    vi.mocked(getAdoptionById).mockResolvedValueOnce({
      id: 'adoption-field-001-caretaker-zhang',
      userId: 'user-demo',
      fieldId: 'field-001',
      caretakerId: 'caretaker-zhang',
      status: 'pending_payment',
      paymentOrderId: 'payment-field-001-caretaker-zhang',
      createdAt: '2026-05-23T10:00:00+08:00'
    })
    vi.mocked(getFieldById).mockResolvedValueOnce(fields[0])
    vi.mocked(getCaretakerById).mockResolvedValueOnce(caretakers[0])

    const wrapper = mount(PaymentConfirmPage, { props: { adoptionId: 'adoption-field-001-caretaker-zhang' } })
    await flushPromises()

    await wrapper.get('[data-test="pay-button"]').trigger('click')
    await flushPromises()
    vi.advanceTimersByTime(1600)
    await flushPromises()

    expect(wrapper.text()).toContain('支付成功')
    expect(wrapper.text()).toContain('查看认养详情')
    expect(wrapper.text()).toContain('返回田园')

    await wrapper.get('[data-test="view-adoption-detail"]').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/adoption/detail?adoption_id=adoption-field-001-caretaker-zhang' })

    await wrapper.get('[data-test="return-garden"]').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/garden/index' })
  })

  it('accepts adoption_id prop', async () => {
    vi.mocked(getAdoptionById).mockResolvedValueOnce({
      id: 'adoption-field-001-caretaker-zhang',
      userId: 'user-demo',
      fieldId: 'field-001',
      caretakerId: 'caretaker-zhang',
      status: 'pending_payment',
      paymentOrderId: 'payment-field-001-caretaker-zhang',
      createdAt: '2026-05-23T10:00:00+08:00'
    })
    vi.mocked(getFieldById).mockResolvedValueOnce(fields[0])
    vi.mocked(getCaretakerById).mockResolvedValueOnce(caretakers[0])

    mount(PaymentConfirmPage, { props: { adoption_id: 'adoption-field-001-caretaker-zhang' } })
    await flushPromises()

    expect(getAdoptionById).toHaveBeenCalledWith('adoption-field-001-caretaker-zhang')
  })

  it('shows error state for missing adoption', async () => {
    vi.mocked(getAdoptionById).mockRejectedValueOnce(new Error('认养记录不存在'))

    const wrapper = mount(PaymentConfirmPage, { props: { adoptionId: 'missing-adoption' } })
    await flushPromises()

    expect(wrapper.text()).toContain('认养记录不存在')
  })
})
