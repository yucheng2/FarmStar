// Minimal test setup for caretaker-app
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

config.global.stubs = {
  view: { template: '<div><slot /></div>' },
  text: { template: '<span><slot /></span>' },
  image: { template: '<img :src="src" :alt="alt" />', props: ['src', 'alt'] },
  'scroll-view': { template: '<div><slot /></div>' },
  button: { template: '<button><slot /></button>' },
  input: { template: '<input />' }
}

const navigateTo = vi.fn()
const reLaunch = vi.fn()
const showToast = vi.fn()

Object.defineProperty(globalThis, 'uni', {
  value: { navigateTo, reLaunch, showToast },
  writable: true
})
