import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CaretakerDetailModal from '../../src/components/CaretakerDetailModal.vue'
import { caretakers } from '../../src/mocks/gardenData'


describe('CaretakerDetailModal', () => {
  it('does not render when closed', () => {
    const wrapper = mount(CaretakerDetailModal, { props: { open: false, caretaker: caretakers[0] } })

    expect(wrapper.find('[data-test="caretaker-modal"]').exists()).toBe(false)
  })

  it('renders caretaker detail when open', () => {
    const wrapper = mount(CaretakerDetailModal, { props: { open: true, caretaker: caretakers[0] } })

    expect(wrapper.text()).toContain('张叔')
    expect(wrapper.text()).toContain('青禾村')
    expect(wrapper.text()).toContain('18年管护经验')
    expect(wrapper.text()).toContain('近30天完成：24')
    expect(wrapper.text()).toContain('好评率：98%')
  })

  it('emits close and responsible fields actions', async () => {
    const wrapper = mount(CaretakerDetailModal, { props: { open: true, caretaker: caretakers[0] } })

    await wrapper.get('[data-test="responsible-fields"]').trigger('click')
    await wrapper.get('[data-test="close-modal"]').trigger('click')

    expect(wrapper.emitted('responsibleFields')).toEqual([[caretakers[0]]])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits contact action', async () => {
    const wrapper = mount(CaretakerDetailModal, { props: { open: true, caretaker: caretakers[0] } })

    await wrapper.get('[data-test="contact-caretaker"]').trigger('click')

    expect(wrapper.emitted('contact')).toEqual([[caretakers[0]]])
  })
})
