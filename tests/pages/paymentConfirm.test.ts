import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PaymentConfirmPage from '../../src/pages/payment/confirm.vue'
import { getAdoptionById } from '../../src/services/gardenApi'

vi.mock('../../src/services/gardenApi', () => ({
  getAdoptionById: vi.fn()
}))

describe('PaymentConfirmPage', () => {
  beforeEach(() => {
    vi.mocked(uni.showToast).mockClear()
    vi.mocked(getAdoptionById).mockReset()
  })

  it('renders stored adoption and handles payment click', async () => {
    vi.mocked(getAdoptionById).mockResolvedValueOnce({
      id: 'adoption-field-001-caretaker-zhang',
      userId: 'user-demo',
      fieldId: 'field-001',
      caretakerId: 'caretaker-zhang',
      status: 'pending_payment',
      paymentOrderId: 'payment-field-001-caretaker-zhang',
      createdAt: '2026-05-23T10:00:00+08:00'
    })

    const wrapper = mount(PaymentConfirmPage, { props: { adoptionId: 'adoption-field-001-caretaker-zhang' } })
    await flushPromises()

    expect(getAdoptionById).toHaveBeenCalledWith('adoption-field-001-caretaker-zhang')
    expect(wrapper.text()).toContain('认养待支付')
    expect(wrapper.text()).toContain('支付单号：payment-field-001-caretaker-zhang')

    await wrapper.get('[data-test="pay-button"]').trigger('click')

    expect(uni.showToast).toHaveBeenCalledWith({ title: '支付功能暂未开放', icon: 'none' })
  })

  it('shows not found state for missing adoption', async () => {
    vi.mocked(getAdoptionById).mockRejectedValueOnce(new Error('认养记录不存在'))

    const wrapper = mount(PaymentConfirmPage, { props: { adoptionId: 'missing-adoption' } })
    await flushPromises()

    expect(wrapper.text()).toContain('未找到认养记录')
  })
})
