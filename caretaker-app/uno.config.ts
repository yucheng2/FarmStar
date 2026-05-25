import {
  defineConfig,
  presetWind,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      primary: 'var(--color-primary)',
      'primary-foreground': 'var(--color-primary-foreground)',
      secondary: 'var(--color-secondary)',
      'secondary-foreground': 'var(--color-secondary-foreground)',
      background: 'var(--color-background)',
      foreground: 'var(--color-foreground)',
      card: 'var(--color-card)',
      'card-foreground': 'var(--color-card-foreground)',
      muted: 'var(--color-muted)',
      'muted-foreground': 'var(--color-muted-foreground)',
      border: 'var(--color-border)',
      accent: 'var(--color-accent)',
      'accent-foreground': 'var(--color-accent-foreground)',
      destructive: 'var(--color-destructive)',
      'destructive-foreground': 'var(--color-destructive-foreground)',
    },
    fontFamily: {
      sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    borderRadius: {
      sm: '8px',
      DEFAULT: '12px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '24px',
      full: '9999px',
    },
    boxShadow: {
      sm: '0 1px 2px 0 rgb(21 128 61 / 0.05)',
      DEFAULT: '0 4px 6px -1px rgb(21 128 61 / 0.08), 0 2px 4px -2px rgb(21 128 61 / 0.04)',
      md: '0 4px 6px -1px rgb(21 128 61 / 0.08), 0 2px 4px -2px rgb(21 128 61 / 0.04)',
      lg: '0 10px 15px -3px rgb(21 128 61 / 0.08), 0 4px 6px -4px rgb(21 128 61 / 0.04)',
      xl: '0 20px 25px -5px rgb(21 128 61 / 0.08), 0 8px 10px -6px rgb(21 128 61 / 0.04)',
    },
    spacing: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      12: '48px',
    },
  },
  shortcuts: {
    'btn-primary': 'bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-semibold text-base cursor-pointer transition-all shadow-[0_4px_12px_rgba(21,128,61,0.3)] hover:bg-[#166534] active:scale-98',
    'btn-secondary': 'bg-card text-primary border-2 border-border rounded-xl px-5 py-3 font-semibold text-base cursor-pointer transition-all hover:bg-background',
    'card': 'bg-card rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]',
    'input-field': 'bg-card border-2 border-border rounded-xl px-4 py-3 text-base text-foreground w-full box-border transition-all focus:border-primary focus:outline-none',
    'input-label': 'block text-sm font-semibold text-foreground mb-2',
    'safe-area-bottom': 'pb-[env(safe-area-inset-bottom,0)]',
  },
  safelist: [
    // Shortcuts
    'btn-primary', 'btn-secondary', 'btn-secondary-active', 'card', 'input-field', 'input-label', 'safe-area-bottom',
    // Layout
    'flex', 'flex-col', 'flex-wrap', 'inline-flex',
    'items-center', 'items-start', 'items-end',
    'justify-center', 'justify-between', 'justify-start', 'justify-end',
    // Spacing
    'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-8',
    'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-6', 'mt-8',
    'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-6', 'mb-8',
    'ml-1', 'ml-2', 'ml-3', 'ml-4',
    'mr-1', 'mr-2', 'mr-3', 'mr-4',
    'mx-auto', 'my-auto',
    'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8',
    'px-2', 'px-3', 'px-4', 'px-6',
    'py-1', 'py-2', 'py-3', 'py-4',
    // Typography
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl',
    'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold',
    'leading-relaxed', 'leading-tight',
    'text-left', 'text-center', 'text-right',
    // Colors
    'text-primary', 'text-secondary', 'text-foreground', 'text-muted', 'text-muted-foreground',
    'text-accent', 'text-destructive', 'text-white',
    'bg-primary', 'bg-secondary', 'bg-background', 'bg-card', 'bg-muted', 'bg-accent', 'bg-destructive',
    'bg-opacity-10',
    // Visual
    'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full',
    'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl',
    // Sizing
    'w-full', 'w-1/2', 'w-auto', 'h-full', 'h-11', 'h-12', 'h-auto',
    'min-h-dvh', 'min-h-screen', 'min-h-full',
    'max-w-xs', 'max-w-md', 'max-w-lg', 'max-w-xl',
    // Position
    'absolute', 'relative', 'fixed', 'sticky',
    'hidden', 'block', 'inline-block', 'inline',
    'overflow-auto', 'overflow-hidden', 'overflow-scroll',
    'z-0', 'z-10', 'z-20', 'z-40', 'z-50',
    'top-0', 'top-1', 'top-2', 'top-4',
    'right-0', 'right-1', 'right-2',
    'bottom-0', 'bottom-1', 'bottom-2',
    'left-0', 'left-1', 'left-2',
    'inset-0',
    // Border
    'border', 'border-0', 'border-2', 'border-b', 'border-t', 'border-l', 'border-r',
    'border-border', 'border-primary',
    // Effect
    'opacity-0', 'opacity-50', 'opacity-75', 'opacity-100',
    'cursor-pointer', 'select-none', 'pointer-events-none', 'transition-all',
    // Flex utilities
    'flex-1', 'flex-auto', 'flex-none', 'flex-shrink-0', 'flex-grow',
    'shrink-0', 'grow',
    // Misc
    'whitespace-nowrap', 'truncate', 'line-clamp-2',
    'first:mt-0',
  ],
})
