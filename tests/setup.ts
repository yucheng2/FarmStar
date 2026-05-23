import { config } from '@vue/test-utils'
import { vi } from 'vitest'

config.global.stubs = {
  view: { template: '<div><slot /></div>' },
  text: { template: '<span><slot /></span>' },
  image: { template: '<img :src="src" :alt="alt" @click="$emit(\'click\', $event)" />', props: ['src', 'alt'] },
  'scroll-view': { template: '<div><slot /></div>' },
  button: { template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>', props: ['disabled'] },
  input: { template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', ($event.target as HTMLInputElement).value)" />', props: ['modelValue'] }
}

const navigateTo = vi.fn()
const showToast = vi.fn()
const showModal = vi.fn()

Object.defineProperty(globalThis, 'uni', {
  value: {
    navigateTo,
    showToast,
    showModal
  },
  writable: true
})
