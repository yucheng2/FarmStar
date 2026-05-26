<script setup lang="ts"></script>

<template>
  <slot />
</template>

<style>
:root {
  --color-primary: #15803D;
  --color-primary-foreground: #ffffff;
  --color-secondary: #22c55e;
  --color-secondary-foreground: #ffffff;
  --color-background: #F0FDF4;
  --color-foreground: #14532D;
  --color-card: #ffffff;
  --color-card-foreground: #14532D;
  --color-muted: #f0fdf4;
  --color-muted-foreground: #6B766B;
  --color-border: #BBF7D0;
  --color-accent: #22c55e;
  --color-accent-foreground: #ffffff;
  --color-destructive: #ef4444;
  --color-destructive-foreground: #ffffff;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --radius-full: 9999px;
  --shadow-md: 0 4px 6px -1px rgb(21 128 61 / 0.08), 0 2px 4px -2px rgb(21 128 61 / 0.04);
}

html,
body,
#app,
uni-app,
uni-page,
uni-page-wrapper,
uni-page-body {
  min-height: 100%;
  margin: 0;
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
  touch-action: manipulation;
}

body {
  overflow-x: hidden;
}

page {
  max-width: 480px;
  min-height: 100vh;
  margin: 0 auto;
  background: var(--color-background);
  box-sizing: border-box;
}

button,
image,
view,
text {
  touch-action: manipulation;
}
</style>
