# caretaker-home header 布局问题修复记录

## 问题一：header 内容居中（根本原因）

**现象**：`caretaker-home` 的 header 内容全部挤在屏幕中间，`justify-content: space-between` 不生效。

**根本原因**：Vue 组件的 `<style>` 默认是**全局作用域**。`caretaker-map/index.vue` 里有一条全局 CSS 规则：

```css
/* caretaker-map/index.vue */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;  /* ← 这条规则污染了所有页面的 .header */
}
```

因为 App.vue 同时 import 了所有页面组件，所有页面的 CSS 都被加载到同一个全局作用域。map 页面的 `.header` 规则覆盖了 home 页面的 `.header`，导致 `align-items: center` 把子元素全部水平居中并收缩到内容宽度。

**验证方式**：在浏览器里执行 JS 检查计算样式：

```js
getComputedStyle(document.querySelector('.header')).alignItems
// 返回 "center" — 但 home 页面的 CSS 里根本没写这个
```

**修复**：把 home 页面的 header 类名从 `.header` 改为 `.home-header`，彻底避开命名冲突。

---

## 问题二：统计数字样式不清晰

**现象**：统计卡片（田地/紧急/待办）放在绿色 header 内，数字用半透明白色背景，视觉上"空"且难以区分。

**修复**：把统计区域移出 header，作为独立的白底区域紧贴 header 下方，数字用语义色彩：

```
绿色 home-header（品牌 + 日期 | 问候语 + 位置 + 头像）
─────────────────────────────────
白底 stats-row（0田地 | 0紧急 | 0待办）  ← 绿/红/橙三色数字
─────────────────────────────────
筛选栏 + 任务列表
```

---

## 经验教训

Vue 的 `<style>` 不加 `scoped` 时是全局的。多个页面同时被 import（即使用 `v-if` 控制显示），它们的 CSS 全部生效。**解决方案**：

1. 给每个组件加 `<style scoped>`（推荐）
2. 或者用页面前缀命名类（如 `.home-header`、`.map-header`）

---

## 相关文件

- `caretaker-app/src/pages/caretaker-home/index.vue` — 首页页面
- `caretaker-app/src/pages/caretaker-map/index.vue` — 地图页面（污染源）
- `caretaker-app/src/App.vue` — 根组件，同时 import 所有页面
