import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PaymentConfirmPage from '../../src/pages/payment/confirm.vue'
import { createAdoption } from '../../src/services/gardenApi'

describe('PaymentConfirmPage', () => {
  beforeEach(() => {
    vi.mocked(uni.showToast).mockClear()
  })

  it('renders stored adoption and handles payment click', async () => {
    await createAdoption({ fieldId: 'field-001', caretakerId: 'caretaker-zhang' })
    const wrapper = mount(PaymentConfirmPage, { props: { adoptionId: 'adoption-field-001-caretaker-zhang' } })

    expect(wrapper.text()).toContain('认养待支付')
    expect(wrapper.text()).toContain('支付单号：payment-field-001-caretaker-zhang')

    await wrapper.get('[data-test="pay-button"]').trigger('click')

    expect(uni.showToast).toHaveBeenCalledWith({ title: '支付功能暂未开放', icon: 'none' })
  })

  it('shows not found state for missing adoption', () => {
    const wrapper = mount(PaymentConfirmPage, { props: { adoptionId: 'missing-adoption' } })

    expect(wrapper.text()).toContain('未找到认养记录')
  })
})
