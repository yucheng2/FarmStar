# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FarmStar is an agricultural management platform organized as a multi-repo workspace:

1. **caretaker-app/** - Primary Vue 3 H5 mobile app for caretakers (active development)
2. **garden-web/** - Uni-app based web application
3. **garden-server/** - Node.js/Fastify backend API

## Development Commands

### caretaker-app
```bash
cd caretaker-app
npm install
npm run dev        # Dev server on port 5173
npm run build      # Production build
npm test           # Run Vitest tests
```

### garden-web
```bash
cd garden-web
npm install
npm run dev:h5     # H5 dev server
npm run build:h5   # H5 production build
npm test           # Run Vitest tests
```

### garden-server
```bash
cd garden-server
npm install
npm run dev        # Starts Fastify server on port 3000
```

## Architecture

### caretaker-app Structure
```
caretaker-app/src/
├── pages/              # Page components (one dir per page)
│   ├── caretaker-login/
│   ├── caretaker-home/
│   ├── caretaker-map/
│   ├── caretaker-field/
│   ├── caretaker-care-log/
│   ├── caretaker-scan/
│   └── caretaker-profile/
├── components/          # Reusable Vue components
├── services/           # API services (authApi.ts, caretakerApi.ts)
├── composables/        # Vue composables
├── types/              # TypeScript type definitions
├── mocks/              # Mock data
├── utils/              # Utilities (uni-mock.ts for API mocking)
└── styles/             # Global CSS
```

### Component Convention
Uses uni-app style components (`<view>`, `<text>`, `<image>`) that are transformed to native HTML via Vite plugin:
- `<view>` → `<div>`
- `<text>` → `<span>`
- `<image>` → `<img>`

### Page Styles
All caretaker-app pages must follow these rules strictly:
1. Only Flex layout - no float or absolute positioning
2. Global CSS reset for browser compatibility
3. Fluid widths - no fixed pixel widths on containers
4. Horizontal centering and auto wrap - no horizontal scroll
5. Mobile-first, concise code with comments
6. Only essential styles - no redundancy

Example structure:
```vue
<template>
  <view class="page-container">
    <view class="header">...</view>
    <view class="content">...</view>
  </view>
</template>

<style>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: var(--color-background, #F0FDF4);
  padding-bottom: 80px; /* BottomNav safe area */
}
.header, .content {
  display: flex;
  /* Use flex properties for layout */
}
</style>
```

### API Mocking
`src/utils/uni-mock.ts` mocks uni-app APIs (navigateTo, switchTab, showToast, etc.) for web development. When adding new pages, ensure navigation uses `uni` from this module.

### Mock Data
Mock data lives in `src/mocks/gardenData.ts`. Services in `src/services/` use this data with simulated network delay (300ms).

### CSS Global Scope Issue
Vue `<style>` without `scoped` is global. Multiple imported page components share CSS scope. Use unique class names per page (e.g., `.home-header`, `.map-header`) or add `<style scoped>` to avoid conflicts.

## Theme Colors (CSS Variables)
```css
--color-primary: #15803D
--color-background: #F0FDF4
--color-foreground: #14532D
--color-border: #BBF7D0
--color-muted-foreground: #6B766B
```
