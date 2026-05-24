import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CaretakerAvatarCard from '../../src/components/CaretakerAvatarCard.vue'
import { caretakers } from '../../src/mocks/gardenData'


describe('CaretakerAvatarCard', () => {
  it('renders caretaker summary', () => {
    const wrapper = mount(CaretakerAvatarCard, { props: { caretaker: caretakers[0], selected: false } })

    expect(wrapper.text()).toContain('张叔')
    expect(wrapper.text()).toContain('4.9')
    expect(wrapper.text()).toContain('18年经验')
  })

  it('applies selected class and emits select', async () => {
    const wrapper = mount(CaretakerAvatarCard, { props: { caretaker: caretakers[0], selected: true } })

    expect(wrapper.classes()).toContain('border-primary')

    await wrapper.trigger('click')

    expect(wrapper.emitted('select')).toEqual([[caretakers[0]]])
  })

  it('emits detail when detail button is clicked', async () => {
    const wrapper = mount(CaretakerAvatarCard, { props: { caretaker: caretakers[0], selected: false } })

    await wrapper.get('[data-test="caretaker-detail"]').trigger('click')

    expect(wrapper.emitted('detail')).toEqual([[caretakers[0]]])
  })
})
