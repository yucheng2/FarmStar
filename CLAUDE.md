# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FarmStar is an agricultural management platform with two applications:

1. **caretaker-app/** - Primary Vue 3 H5 mobile app for caretakers (this is where active development happens)
2. **Root directory** - Uni-app based application (legacy/secondary)

## Development Commands

### caretaker-app (main development target)
```bash
cd caretaker-app
npm run dev        # Start dev server on port 5174
npm test           # Run tests with Vitest
```

### Root directory
```bash
npm run dev:h5     # Start uni-app H5 dev server
npm test           # Run tests
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

## Theme Colors (CSS Variables)
```css
--color-primary: #15803D
--color-background: #F0FDF4
--color-foreground: #14532D
--color-border: #BBF7D0
--color-muted-foreground: #6B766B
```
