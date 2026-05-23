import type { AnalyticsEvent } from '../types/garden'

type TrackableAnalyticsEvent = Omit<AnalyticsEvent, 'timestamp'> & Partial<Pick<AnalyticsEvent, 'timestamp'>>

const events: AnalyticsEvent[] = []

export function trackEvent(event: TrackableAnalyticsEvent) {
  events.push({
    ...event,
    timestamp: event.timestamp ?? '2026-05-23T10:00:00+08:00'
  })
}

export function getAnalyticsEvents() {
  return [...events]
}

export function clearAnalyticsEvents() {
  events.length = 0
}
