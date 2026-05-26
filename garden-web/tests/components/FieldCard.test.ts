import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FieldCard from '../../src/components/FieldCard.vue'
import { fields } from '../../src/mocks/gardenData'


describe('FieldCard', () => {
  it('renders field cover image when imageUrl exists', () => {
    const field = { ...fields[0], imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=480&fit=crop' }
    const wrapper = mount(FieldCard, { props: { field } })

    const cover = wrapper.get('[data-test="field-cover"]')
    expect(cover.attributes('src')).toContain('https://images.unsplash.com/')
    expect(cover.attributes('alt')).toBe('青禾村东头菜地')
    expect(cover.attributes('style')).toContain('height: 150px')
  })

  it('renders caretaker avatar as a compact chip image', () => {
    const wrapper = mount(FieldCard, { props: { field: fields[0] } })

    const avatar = wrapper.get('[data-test="caretaker-avatar"]')
    expect(avatar.attributes('style')).toContain('width: 36px')
    expect(avatar.attributes('style')).toContain('height: 36px')
  })

  it('renders idle field and emits adopt action', async () => {
    const wrapper = mount(FieldCard, { props: { field: fields[0] } })

    expect(wrapper.text()).toContain('青禾村东头菜地')
    expect(wrapper.text()).toContain('面积：10㎡')
    expect(wrapper.text()).toContain('空闲')
    expect(wrapper.text()).toContain('立即认养')

    await wrapper.get('[data-test="field-action"]').trigger('click')

    expect(wrapper.emitted('adopt')).toEqual([[fields[0]]])
  })

  it('renders adopted crop progress and emits details action', async () => {
    const wrapper = mount(FieldCard, { props: { field: fields[1] } })

    expect(wrapper.text()).toContain('我的小菜园')
    expect(wrapper.text()).toContain('西红柿')
    expect(wrapper.text()).toContain('60%')
    expect(wrapper.text()).toContain('查看详情')

    await wrapper.get('[data-test="field-action"]').trigger('click')

    expect(wrapper.emitted('details')).toEqual([[fields[1]]])
  })

  it('emits caretaker click when avatar is clicked', async () => {
    const wrapper = mount(FieldCard, { props: { field: fields[0] } })

    await wrapper.get('[data-test="caretaker-avatar"]').trigger('click')

    expect(wrapper.emitted('caretaker')).toEqual([[fields[0].caretaker]])
  })
})
