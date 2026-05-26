import { beforeEach, describe, expect, it } from 'vitest'
import { clearAnalyticsEvents, getAnalyticsEvents, trackEvent } from '../../src/services/analytics'


describe('analytics', () => {
  beforeEach(() => {
    clearAnalyticsEvents()
  })

  it('records analytics event with timestamp', () => {
    trackEvent({ event: 'page_view', userId: 'user-demo', pageName: 'garden' })

    expect(getAnalyticsEvents()).toEqual([
      {
        event: 'page_view',
        userId: 'user-demo',
        pageName: 'garden',
        timestamp: '2026-05-23T10:00:00+08:00'
      }
    ])
  })

  it('keeps caretaker event fields', () => {
    trackEvent({ event: 'caretaker_select', userId: 'user-demo', caretakerId: 'caretaker-zhang', fieldId: 'field-001' })

    expect(getAnalyticsEvents()[0]).toMatchObject({
      event: 'caretaker_select',
      userId: 'user-demo',
      caretakerId: 'caretaker-zhang',
      fieldId: 'field-001'
    })
  })
})
