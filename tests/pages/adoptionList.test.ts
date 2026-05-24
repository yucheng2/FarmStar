import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdoptionListPage from '../../src/pages/adoption/index.vue'
import { caretakers, fields } from '../../src/mocks/gardenData'
import { getMyAdoptions } from '../../src/services/gardenApi'

vi.mock('../../src/services/gardenApi', () => ({
  getMyAdoptions: vi.fn()
}))

describe('AdoptionListPage', () => {
  beforeEach(() => {
    vi.mocked(uni.navigateTo).mockClear()
    vi.mocked(getMyAdoptions).mockReset()
  })

  it('renders my adoptions', async () => {
    vi.mocked(getMyAdoptions).mockResolvedValueOnce({
      items: [
        {
          id: 'adoption-field-002-caretaker-li',
          userId: 'user-demo',
          fieldId: 'field-002',
          caretakerId: 'caretaker-li',
          status: 'pending_payment',
          paymentOrderId: 'payment-field-002-caretaker-li',
          createdAt: '2026-05-23T10:00:00+08:00',
          field: fields[1],
          caretaker: caretakers[1]
        }
      ],
      pagination: {}
    })

    const wrapper = mount(AdoptionListPage)
    await flushPromises()

    expect(wrapper.text()).toContain('我的认养')
    expect(wrapper.text()).toContain('申请已提交')
    expect(wrapper.text()).toContain('我的小菜园')
    expect(wrapper.text()).toContain('田地002')
    expect(wrapper.text()).toContain('西红柿')
    expect(wrapper.text()).toContain('李伯')
  })

  it('opens adoption detail', async () => {
    vi.mocked(getMyAdoptions).mockResolvedValueOnce({
      items: [
        {
          id: 'adoption-field-002-caretaker-li',
          userId: 'user-demo',
          fieldId: 'field-002',
          caretakerId: 'caretaker-li',
          status: 'pending_payment',
          paymentOrderId: 'payment-field-002-caretaker-li',
          createdAt: '2026-05-23T10:00:00+08:00',
          field: fields[1],
          caretaker: caretakers[1]
        }
      ],
      pagination: {}
    })

    const wrapper = mount(AdoptionListPage)
    await flushPromises()
    await wrapper.get('[data-test="view-adoption-detail"]').trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/adoption/detail?adoption_id=adoption-field-002-caretaker-li' })
  })

  it('shows empty state and returns to garden', async () => {
    vi.mocked(getMyAdoptions).mockResolvedValueOnce({ items: [], pagination: {} })

    const wrapper = mount(AdoptionListPage)
    await flushPromises()
    const actionBtn = wrapper.findAll('button').find(el => el.text() === '去认养田地')
    expect(actionBtn).toBeTruthy()
    await actionBtn!.trigger('click')

    expect(wrapper.text()).toContain('暂无认养记录')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/garden/index' })
  })

  it('shows error state', async () => {
    vi.mocked(getMyAdoptions).mockRejectedValueOnce(new Error('接口不可用'))

    const wrapper = mount(AdoptionListPage)
    await flushPromises()

    expect(wrapper.text()).toContain('加载失败')
    expect(wrapper.text()).toContain('接口不可用')
  })
})
