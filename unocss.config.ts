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
      sans: 'Inter, system-ui, -apple-system, sans-serif',
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
    'btn-primary': 'bg-primary text-primary-foreground rounded-full px-5 py-3 font-semibold text-sm transition-all cursor-pointer border-none shadow-md hover:bg-[#166534] active:scale-98',
    'btn-secondary': 'bg-card text-muted-foreground border border-border rounded-full px-4 py-2 font-medium text-sm cursor-pointer transition-all hover:bg-muted',
    'card': 'bg-card rounded-lg shadow-md p-4',
    'input-field': 'bg-card border border-border rounded-full px-4 py-3 text-sm text-foreground w-full box-border transition-all focus:border-primary focus:outline-none',
    'input-label': 'block text-sm font-semibold text-foreground mb-2',
    'safe-area-bottom': 'pb-[env(safe-area-inset-bottom,0)]',
  },
})
