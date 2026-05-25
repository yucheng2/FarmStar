# UnoCSS Migration Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 两个 uniapp 项目（caretaker-app 和 garden-web）从 Tailwind CSS v4 切换到 UnoCSS，消除 Tailwind v4 的 `@layer base` cascade bug，获得更干净的 CSS 构建。

**Architecture:** UnoCSS 替换 @tailwindcss/vite，保留现有 FarmStar CSS variables 设计系统不变，class 命名一一对应映射。

**Tech Stack:** UnoCSS, @unocss/vite

---

## Why UnoCSS over Tailwind v4

Tailwind v4 的 `@layer base` 会把基础重置样式放在 cascade 末尾，等同于 `!important`，导致 `.mt-4` 等 class 的 `margin-top` 被 `* { margin: 0 }` 覆盖。UnoCSS 没有这个问题，且构建速度更快。

---

## Design System Mapping

### Colors（保持不变，CSS variables 直接复用）

| 用途 | CSS Variable | UnoCSS Token |
|---|---|---|
| Primary | `--color-primary: #15803D` | `primary` |
| Secondary | `--color-secondary: #22C55E` | `secondary` |
| Background | `--color-background: #F0FDF4` | `background` |
| Foreground | `--color-foreground: #14532D` | `foreground` |
| Card | `--color-card: #FFFFFF` | `card` |
| Muted | `--color-muted: #E8F0F1` | `muted` |
| Muted Foreground | `--color-muted-foreground: #64748B` | `muted` |
| Border | `--color-border: #BBF7D0` | `border` |
| Accent | `--color-accent: #A16207` | `accent` |
| Destructive | `--color-destructive: #DC2626` | `destructive` |

### Utility Classes（一对一映射）

#### Layout
| Tailwind | UnoCSS |
|---|---|
| `flex` | `flex` |
| `flex-col` | `flex-col` |
| `flex-wrap` | `flex-wrap` |
| `grid` | `grid` |
| `inline-flex` | `inline-flex` |
| `items-center` | `items-center` |
| `items-start` | `items-start` |
| `items-end` | `items-end` |
| `justify-center` | `justify-center` |
| `justify-between` | `justify-between` |
| `justify-start` | `justify-start` |
| `justify-end` | `justify-end` |

#### Spacing（UnoCSS 原生支持，无需额外配置）
| Tailwind | UnoCSS |
|---|---|
| `gap-1` ~ `gap-12` | `gap-1` ~ `gap-12` |
| `mt-1` ~ `mt-12` | `mt-1` ~ `mt-12` |
| `mb-1` ~ `mb-12` | `mb-1` ~ `mb-12` |
| `ml-1` ~ `ml-12` | `ml-1` ~ `ml-12` |
| `mr-1` ~ `mr-12` | `mr-1` ~ `mr-12` |
| `mx-1` ~ `mx-12` | `mx-1` ~ `mx-12` |
| `my-1` ~ `my-12` | `my-1` ~ `my-12` |
| `p-1` ~ `p-12` | `p-1` ~ `p-12` |
| `px-1` ~ `px-12` | `px-1` ~ `px-12` |
| `py-1` ~ `py-12` | `py-1` ~ `py-12` |

#### Typography
| Tailwind | UnoCSS |
|---|---|
| `text-xs` | `text-xs` |
| `text-sm` | `text-sm` |
| `text-base` | `text-base` |
| `text-lg` | `text-lg` |
| `text-xl` | `text-xl` |
| `text-2xl` | `text-2xl` |
| `font-light` | `font-light` |
| `font-normal` | `font-normal` |
| `font-medium` | `font-medium` |
| `font-semibold` | `font-semibold` |
| `font-bold` | `font-bold` |
| `leading-relaxed` | `leading-relaxed` |

#### Sizing
| Tailwind | UnoCSS |
|---|---|
| `w-full` | `w-full` |
| `w-1/2` | `w-1/2` |
| `h-full` | `h-full` |
| `h-11` | `h-11` |
| `h-12` | `h-12` |
| `min-h-dvh` | `min-h-dvh` |
| `min-h-screen` | `min-h-screen` |
| `max-w-` 系列 | `max-w-` 系列 |

#### Visual
| Tailwind | UnoCSS |
|---|---|
| `rounded-sm` | `rounded-sm` |
| `rounded-md` | `rounded-md` |
| `rounded-lg` | `rounded-lg` |
| `rounded-xl` | `rounded-xl` |
| `rounded-full` | `rounded-full` |
| `rounded-2xl` | `rounded-2xl` |
| `shadow-sm` | `shadow-sm` |
| `shadow-md` | `shadow-md` |
| `shadow-lg` | `shadow-lg` |
| `shadow-xl` | `shadow-xl` |

#### Positioning
| Tailwind | UnoCSS |
|---|---|
| `absolute` | `absolute` |
| `relative` | `relative` |
| `fixed` | `fixed` |
| `sticky` | `sticky` |
| `hidden` | `hidden` |
| `block` | `block` |
| `inline-block` | `inline-block` |
| `overflow-auto` | `overflow-auto` |
| `overflow-hidden` | `overflow-hidden` |
| `z-0` ~ `z-50` | `z-0` ~ `z-50` |
| `top-0` ~ `top-12` | `top-0` ~ `top-12` |
| `right-0` ~ `right-12` | `right-0` ~ `right-12` |
| `bottom-0` ~ `bottom-12` | `bottom-0` ~ `bottom-12` |
| `left-0` ~ `left-12` | `left-0` ~ `left-12` |
| `inset-0` | `inset-0` |

#### Interactive
| Tailwind | UnoCSS |
|---|---|
| `cursor-pointer` | `cursor-pointer` |
| `select-none` | `select-none` |
| `pointer-events-none` | `pointer-events-none` |
| `transition-all` | `transition-all` |

#### Special Classes（Shortcuts）
| Tailwind | UnoCSS Shortcut |
|---|---|
| `btn-primary` | `btn-primary` |
| `btn-secondary` | `btn-secondary` |
| `card` | `card` |
| `input-field` | `input-field` |
| `input-label` | `input-label` |
| `safe-area-bottom` | `safe-area-bottom` |

---

## Migration Plan

### 两个项目共用同一套 UnoCSS 配置

在 FarmStar 根目录创建 `unocss.config.ts`，两个项目都引用它，确保设计一致性。

### 具体步骤

1. **安装依赖**：两个项目都安装 `unocss` + `@unocss/vite`
2. **创建根目录 `unocss.config.ts`**：定义 colors/spacing/typography/shortcuts
3. **修改 `vite.config.ts`**：替换 `@tailwindcss/vite` → `@unocss/vite`
4. **删除 `tailwind.config.js`**：不再需要
5. **更新 `index.css`**：移除 `@import "tailwindcss"` 和 `@layer base` 重置
6. **批量替换 Vue 文件 class**：一一对应替换（脚本完成）
7. **验证效果**：两个项目都正常运行

---

## File Changes

### 新建
- `FarmStar/unocss.config.ts` — 共用 UnoCSS 配置

### 修改
- `caretaker-app/vite.config.ts` — 换用 @unocss/vite
- `caretaker-app/src/styles/index.css` — 移除 tailwindcss import 和 @layer base
- `caretaker-app/package.json` — 添加 unocss 依赖
- `garden-web/vite.config.ts` — 换用 @unocss/vite
- `garden-web/src/styles/index.css` — 移除 tailwindcss import 和 @layer base
- `garden-web/package.json` — 添加 unocss 依赖
- 所有 `.vue` 文件 class 属性

### 删除
- `caretaker-app/tailwind.config.js`（如果存在）
- `garden-web/tailwind.config.js`（如果存在）
