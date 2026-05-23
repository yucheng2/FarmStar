import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PaymentConfirmPage from '../../src/pages/payment/confirm.vue'
import { getAdoptionById } from '../../src/services/gardenApi'

vi.mock('../../src/services/gardenApi', () => ({
  getAdoptionById: vi.fn()
}))

describe('PaymentConfirmPage', () => {
  beforeEach(() => {
    vi.mocked(uni.navigateTo).mockClear()
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
    expect(wrapper.text()).toContain('确认认养')
    expect(wrapper.text()).toContain('支付单号：payment-field-001-caretaker-zhang')

    await wrapper.get('[data-test="pay-button"]').trigger('click')

    expect(wrapper.text()).toContain('认养申请已提交')
    expect(wrapper.text()).toContain('查看认养详情')
    expect(wrapper.text()).toContain('返回田园')
    expect(uni.showToast).toHaveBeenCalledWith({ title: '认养申请已提交', icon: 'none' })

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

    mount(PaymentConfirmPage, { props: { adoption_id: 'adoption-field-001-caretaker-zhang' } })
    await flushPromises()

    expect(getAdoptionById).toHaveBeenCalledWith('adoption-field-001-caretaker-zhang')
  })

  it('shows not found state for missing adoption', async () => {
    vi.mocked(getAdoptionById).mockRejectedValueOnce(new Error('认养记录不存在'))

    const wrapper = mount(PaymentConfirmPage, { props: { adoptionId: 'missing-adoption' } })
    await flushPromises()

    expect(wrapper.text()).toContain('未找到认养记录')
  })
})
