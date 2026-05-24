import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FieldMonitoringPage from '../../src/pages/field-monitoring/index.vue'
import { fieldMonitoringDetails } from '../../src/mocks/gardenData'
import { getFieldMonitoring } from '../../src/services/gardenApi'

vi.mock('../../src/services/gardenApi', () => ({
  getFieldMonitoring: vi.fn()
}))

describe('FieldMonitoringPage', () => {
  beforeEach(() => {
    vi.mocked(uni.navigateTo).mockClear()
    vi.mocked(getFieldMonitoring).mockReset()
  })

  it('renders live monitoring detail for field-002 with snapshots and care logs', async () => {
    vi.mocked(getFieldMonitoring).mockResolvedValueOnce(fieldMonitoringDetails['field-002'])

    const wrapper = mount(FieldMonitoringPage, { props: { fieldId: 'field-002' } })
    await flushPromises()

    expect(getFieldMonitoring).toHaveBeenCalledWith('field-002')
    expect(wrapper.text()).toContain('田地监控')
    expect(wrapper.text()).toContain('我的小菜园')
    expect(wrapper.text()).toContain('西红柿')
    expect(wrapper.text()).toContain('生长进度 60%')
    expect(wrapper.text()).toContain('李伯')
    expect(wrapper.text()).toContain('实时画面直播中')
    expect(wrapper.text()).toContain('摄像头在线')
    expect(wrapper.text()).not.toContain('实时监控暂未开放')
    const liveVideo = wrapper.get('[data-test="live-monitoring-video"]')
    expect(liveVideo.exists()).toBe(true)
    expect(liveVideo.attributes('src')).toBe('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4')
    expect(wrapper.text()).toContain('清晨巡田照片，西红柿长势稳定')
    expect(wrapper.text()).toContain('浇水')
    expect(wrapper.text()).toContain('今日上午完成滴灌补水，土壤湿度正常。')
  })

  it('accepts field_id prop', async () => {
    vi.mocked(getFieldMonitoring).mockResolvedValueOnce(fieldMonitoringDetails['field-002'])

    mount(FieldMonitoringPage, { props: { field_id: 'field-002' } })
    await flushPromises()

    expect(getFieldMonitoring).toHaveBeenCalledWith('field-002')
  })

  it('shows unavailable state when there are no monitoring updates', async () => {
    vi.mocked(getFieldMonitoring).mockResolvedValueOnce(fieldMonitoringDetails['field-001'])

    const wrapper = mount(FieldMonitoringPage, { props: { fieldId: 'field-001' } })
    await flushPromises()

    expect(wrapper.text()).toContain('暂无监控更新')
    expect(wrapper.text()).toContain('管护员更新后会在这里展示照片、短视频和管护记录。')
  })

  it('shows not found state when field id is missing', async () => {
    const wrapper = mount(FieldMonitoringPage)
    await flushPromises()

    expect(getFieldMonitoring).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('未找到田地监控')
  })

  it('shows error state when loading fails', async () => {
    vi.mocked(getFieldMonitoring).mockRejectedValueOnce(new Error('田地不存在'))

    const wrapper = mount(FieldMonitoringPage, { props: { fieldId: 'missing-field' } })
    await flushPromises()

    expect(wrapper.text()).toContain('田地监控加载失败')
    expect(wrapper.text()).toContain('田地不存在')
  })

  it('returns to garden', async () => {
    vi.mocked(getFieldMonitoring).mockResolvedValueOnce(fieldMonitoringDetails['field-002'])

    const wrapper = mount(FieldMonitoringPage, { props: { fieldId: 'field-002' } })
    await flushPromises()
    await wrapper.get('[data-test="return-garden"]').trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/garden/index' })
  })
})
