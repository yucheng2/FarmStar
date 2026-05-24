import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdoptionDetailPage from '../../src/pages/adoption/detail.vue'
import { caretakers, fields } from '../../src/mocks/gardenData'
import { getAdoptionById, getCaretakerById, getFieldById } from '../../src/services/gardenApi'

vi.mock('../../src/services/gardenApi', () => ({
  getAdoptionById: vi.fn(),
  getCaretakerById: vi.fn(),
  getFieldById: vi.fn()
}))

describe('AdoptionDetailPage', () => {
  beforeEach(() => {
    vi.mocked(uni.navigateTo).mockClear()
    vi.mocked(getAdoptionById).mockReset()
    vi.mocked(getFieldById).mockReset()
    vi.mocked(getCaretakerById).mockReset()
  })

  it('renders full adoption detail', async () => {
    vi.mocked(getAdoptionById).mockResolvedValueOnce({
      id: 'adoption-field-002-caretaker-li',
      userId: 'user-demo',
      fieldId: 'field-002',
      caretakerId: 'caretaker-li',
      status: 'pending_payment',
      paymentOrderId: 'payment-field-002-caretaker-li',
      createdAt: '2026-05-23T10:00:00+08:00'
    })
    vi.mocked(getFieldById).mockResolvedValueOnce(fields[1])
    vi.mocked(getCaretakerById).mockResolvedValueOnce(caretakers[1])

    const wrapper = mount(AdoptionDetailPage, { props: { adoptionId: 'adoption-field-002-caretaker-li' } })
    await flushPromises()

    expect(getAdoptionById).toHaveBeenCalledWith('adoption-field-002-caretaker-li')
    expect(wrapper.text()).toContain('认养详情')
    expect(wrapper.text()).toContain('申请已提交')
    expect(wrapper.text()).toContain('adoption-field-002-caretaker-li')
    expect(wrapper.text()).toContain('我的小菜园')
    expect(wrapper.text()).toContain('西红柿')
    expect(wrapper.text()).toContain('生长进度 60%')
    expect(wrapper.text()).toContain('李伯')
    expect(wrapper.text()).toContain('12年经验')
    expect(wrapper.text()).toContain('payment-field-002-caretaker-li')
  })

  it('accepts adoption_id prop', async () => {
    vi.mocked(getAdoptionById).mockResolvedValueOnce({
      id: 'adoption-field-002-caretaker-li',
      userId: 'user-demo',
      fieldId: 'field-002',
      caretakerId: 'caretaker-li',
      status: 'pending_payment',
      paymentOrderId: 'payment-field-002-caretaker-li',
      createdAt: '2026-05-23T10:00:00+08:00'
    })
    vi.mocked(getFieldById).mockResolvedValueOnce(fields[1])
    vi.mocked(getCaretakerById).mockResolvedValueOnce(caretakers[1])

    mount(AdoptionDetailPage, { props: { adoption_id: 'adoption-field-002-caretaker-li' } })
    await flushPromises()

    expect(getAdoptionById).toHaveBeenCalledWith('adoption-field-002-caretaker-li')
  })

  it('shows not found state when adoption id is missing', async () => {
    const wrapper = mount(AdoptionDetailPage)
    await flushPromises()

    expect(getAdoptionById).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('未找到认养记录')
  })

  it('shows not found state for missing adoption', async () => {
    vi.mocked(getAdoptionById).mockRejectedValueOnce(new Error('认养记录不存在'))

    const wrapper = mount(AdoptionDetailPage, { props: { adoptionId: 'missing-adoption' } })
    await flushPromises()

    expect(wrapper.text()).toContain('未找到认养记录')
  })

  it('returns to garden', async () => {
    vi.mocked(getAdoptionById).mockRejectedValueOnce(new Error('认养记录不存在'))

    const wrapper = mount(AdoptionDetailPage, { props: { adoptionId: 'missing-adoption' } })
    await flushPromises()
    await wrapper.get('[data-test="return-garden"]').trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/garden/index' })
  })
})
