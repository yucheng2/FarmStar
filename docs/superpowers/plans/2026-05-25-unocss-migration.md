# UnoCSS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** caretaker-app 和 garden-web 两个 uniapp 项目从 Tailwind CSS v4 切换到 UnoCSS，消除 `@layer base` cascade bug。

**Architecture:** 在 FarmStar 根目录创建共用 `unocss.config.ts`，两个项目都引用它。保留 CSS variables 设计系统不变。

**Tech Stack:** UnoCSS, @unocss/vite

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `FarmStar/unocss.config.ts` | Create | 共用 UnoCSS 配置 |
| `caretaker-app/package.json` | Modify | 添加 unocss 依赖 |
| `caretaker-app/vite.config.ts` | Modify | `@tailwindcss/vite` → `@unocss/vite` |
| `caretaker-app/src/styles/index.css` | Modify | 移除 `@import "tailwindcss"` 和 `@layer base` |
| `garden-web/package.json` | Modify | 添加 unocss 依赖 |
| `garden-web/vite.config.ts` | Modify | `@tailwindcss/vite` → `@unocss/vite` |
| `garden-web/src/styles/index.css` | Modify | 移除 `@import "tailwindcss"` 和 `@layer base` |

两个项目的 Vue 文件 class 属性保持不变（一一对应映射，无需修改）。

---

## Task 1: 创建共用 unocss.config.ts

**Files:**
- Create: `FarmStar/unocss.config.ts`

- [ ] **Step 1: Create unocss.config.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add unocss.config.ts
git commit -m "feat(unocss): add shared UnoCSS config for FarmStar"
```

---

## Task 2: 迁移 caretaker-app

**Files:**
- Modify: `caretaker-app/package.json`
- Modify: `caretaker-app/vite.config.ts`
- Modify: `caretaker-app/src/styles/index.css`

- [ ] **Step 1: Install unocss dependencies**

Run: `npm --prefix caretaker-app install unocss @unocss/vite --save-dev`

- [ ] **Step 2: Update caretaker-app/vite.config.ts**

Replace line:
```typescript
import tailwindcss from '@tailwindcss/vite'
```
With:
```typescript
import UnoCSS from '@unocss/vite'
```

Replace plugins array:
```typescript
plugins: [tailwindcss(), vue(), uniAppTransform()]
```
With:
```typescript
plugins: [vue(), UnoCSS(), uniAppTransform()]
```

- [ ] **Step 3: Update caretaker-app/src/styles/index.css**

Remove the line:
```css
@import "tailwindcss";
```

Remove the entire `@theme {}` block (lines 5-17):
```css
@theme {
  --color-primary: #15803D;
  ...
  --color-accent: #A16207;
}
```

Keep everything else (body, .btn-primary, .card, etc.) unchanged.

- [ ] **Step 4: Verify dev server starts**

Run: `npm --prefix caretaker-app run dev`
Expected: Server starts on port 5174, no Tailwind errors in console

- [ ] **Step 5: Commit**

```bash
git add caretaker-app/package.json caretaker-app/vite.config.ts caretaker-app/src/styles/index.css
git commit -m "feat(caretaker-app): migrate from Tailwind CSS to UnoCSS"
```

---

## Task 3: 迁移 garden-web

**Files:**
- Modify: `garden-web/package.json`
- Modify: `garden-web/vite.config.ts`
- Modify: `garden-web/src/styles/index.css`

- [ ] **Step 1: Install unocss dependencies**

Run: `npm --prefix garden-web install unocss @unocss/vite --save-dev`

- [ ] **Step 2: Update garden-web/vite.config.ts**

Replace line:
```typescript
import tailwindcss from '@tailwindcss/vite'
```
With:
```typescript
import UnoCSS from '@unocss/vite'
```

Replace plugins array:
```typescript
plugins: [tailwindcss(), mode === 'test' ? vue() : uni()]
```
With:
```typescript
plugins: [mode === 'test' ? vue() : uni(), UnoCSS()]
```

- [ ] **Step 3: Update garden-web/src/styles/index.css**

Remove the line:
```css
@import "tailwindcss";
```

Remove the entire `@theme {}` block (lines 3-52):
```css
@import "tailwindcss";
/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@theme {
  --color-primary: #15803D;
  ...
  --shadow-xl: ...;
}
```

Keep body, .btn-primary, .card, .input-field, .input-label, .touch-target and all @layer utilities blocks.

- [ ] **Step 4: Verify dev server starts**

Run: `npm --prefix garden-web run dev:h5`
Expected: Server starts on port 5173, no Tailwind errors in console

- [ ] **Step 5: Commit**

```bash
git add garden-web/package.json garden-web/vite.config.ts garden-web/src/styles/index.css
git commit -m "feat(garden-web): migrate from Tailwind CSS to UnoCSS"
```

---

## Task 4: 验证两个项目

- [ ] **Step 1: Open caretaker-app**

Navigate to http://localhost:5174
Check: Page renders correctly, flex/gap/margin classes work, no `* { margin: 0 }` overriding `mt-*`

- [ ] **Step 2: Open garden-web**

Navigate to http://localhost:5173/#/pages/adoption/index
Check: Page renders correctly, cards have proper spacing, no margin override issue

- [ ] **Step 3: Open garden-web garden page**

Navigate to http://localhost:5173/#/pages/garden/index
Check: Field cards render correctly with spacing

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: complete UnoCSS migration for caretaker-app and garden-web"
```
