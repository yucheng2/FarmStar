# 个人中心子页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 在 caretaker-profile 页面新增三个菜单入口，分别跳转至养护统计、设置、帮助与反馈三个独立页面。

**架构：** 新增三个 Vue 页面组件，在 App.vue 中添加路由解析，pages.json 注册路由。Profile 页面菜单项绑定跳转。

**技术栈：** Vue 3 + Vite + uni-app 组件约定（`<view>` → `<div>`, `<image>` → `<img>`, `<text>` → `<span>`）

---

## 文件清单

| 操作 | 文件 |
|------|------|
| 创建 | `caretaker-app/src/pages/caretaker-stats/index.vue` |
| 创建 | `caretaker-app/src/pages/caretaker-settings/index.vue` |
| 创建 | `caretaker-app/src/pages/caretaker-help/index.vue` |
| 修改 | `caretaker-app/src/App.vue`（路由解析 + 组件注册） |
| 修改 | `caretaker-app/src/pages.json`（路由注册） |
| 修改 | `caretaker-app/src/pages/caretaker-profile/index.vue`（菜单跳转） |

---

## Task 1: 注册路由（pages.json）

**Files:** 修改: `caretaker-app/src/pages.json`

- [ ] **Step 1: 在 pages.json 的 pages 数组中添加三个路由**

在 `caretaker-scan` 之后添加：

```json
{
  "path": "pages/caretaker-stats/index",
  "style": { "navigationBarTitleText": "养护统计" }
},
{
  "path": "pages/caretaker-settings/index",
  "style": { "navigationBarTitleText": "设置" }
},
{
  "path": "pages/caretaker-help/index",
  "style": { "navigationBarTitleText": "帮助与反馈" }
}
```

---

## Task 2: 添加 App.vue 路由解析

**Files:** 修改: `caretaker-app/src/App.vue`

- [ ] **Step 1: 添加三个新页面组件的 import**

在现有 import 之后添加：

```ts
import StatsPage from './pages/caretaker-stats/index.vue'
import SettingsPage from './pages/caretaker-settings/index.vue'
import HelpPage from './pages/caretaker-help/index.vue'
```

- [ ] **Step 2: 在 `getInitialPage()` 函数中添加路由解析**

在 `if (path.includes('care-log')) return 'care-log'` 之后添加：

```ts
if (path.includes('stats')) return 'stats'
if (path.includes('settings')) return 'settings'
if (path.includes('help')) return 'help'
```

- [ ] **Step 3: 在 template 中添加三个新页面的条件渲染**

在 `<CareLogPage v-else-if="currentPage === 'care-log'" />` 之后添加：

```html
<StatsPage v-else-if="currentPage === 'stats'" />
<SettingsPage v-else-if="currentPage === 'settings'" />
<HelpPage v-else-if="currentPage === 'help'" />
```

---

## Task 3: 创建养护统计页面

**Files:** 创建: `caretaker-app/src/pages/caretaker-stats/index.vue`

- [ ] **Step 1: 编写页面代码**

完整实现以下结构：

**Template:**
- 顶部 header：绿色 `#15803D`，padding `48px 16px 16px`，内含返回按钮（`‹` 字符，onclick 调用 `uni.navigateBack()`）和标题「养护统计」
- 数据统计区：四个等宽数字卡片横排（flex: 1），数字绿色 24px 加粗，标签灰色 12px
- 认养数据区：三个指标横排，认养用户数/总收入用橙色 `#D97706`，养护天数用绿色
- 养护记录列表：从 `careLogs` mock 数据读取，按 field 聚合，每条显示动作 emoji + 田地名称 + 养护员 + 相对时间，点击 `uni.navigateTo({ url: \`/pages/caretaker-field/index?field_id=${fieldId}\` })`

**Script:**
- `onMounted` 加载模拟数据
- `formatDate()` 方法转换时间戳为「今天/昨天/X天前」
- Mock 数据：
  ```ts
  const stats = { weeklyCount: 12, monthlyCount: 45, fieldCount: 8, completedCount: 38 }
  const adoptionStats = { userCount: 24, totalIncome: 3600, careDays: 180 }
  const careLogList = [
    { fieldId: 'field-002', fieldName: '我的小菜园', action: '浇水', caretakerName: '李伯', createdAt: new Date().toISOString() },
    { fieldId: 'field-006', fieldName: '北山苹果园', action: '巡检', caretakerName: '吴伯', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { fieldId: 'field-008', fieldName: '青禾村水稻田', action: '水位检查', caretakerName: '张叔', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { fieldId: 'field-002', fieldName: '我的小菜园', action: '除草', caretakerName: '李伯', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  ]
  ```

**Style:**
- 使用类名前缀 `.stats-` 避免全局冲突
- Header：`.stats-header { background: #15803D; padding: 48px 16px 16px; color: white; display: flex; align-items: center; gap: 8px; }`
- 数字卡片区：`.stats-grid { display: flex; gap: 8px; padding: 16px; }`
- 认养区：`.adoption-grid { display: flex; gap: 8px; padding: 0 16px 12px; }`
- 列表区：白底卡片，`.care-log-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #F3F4F6; }`

---

## Task 4: 创建设置页面

**Files:** 创建: `caretaker-app/src/pages/caretaker-settings/index.vue`

- [ ] **Step 1: 编写页面代码**

**Template:**
- 顶部 header 同 stats 页面，标题「设置」
- 个人信息区：头像（圆形 64px，fallback 显示 🌾）、姓名/电话/村庄三个输入框
- 通知设置区：三个开关行（浇水提醒、除草提醒、采收提醒），右侧绿色 toggle 开关
- 账号安全区：修改密码按钮整行可点，点击 `showModal` 输入新密码

**Script:**
- `getCareTakerInfo()` 获取当前用户信息填充表单
- `notificationSettings` ref 初始 `{ watering: true, weeding: true, harvest: true }`
- `handleSave()` 保存时 `showToast('保存成功')`

**Style:**
- 类名前缀 `.settings-`
- Section 分组标题：`.section-title { font-size: 14px; color: #9CA3AF; padding: 12px 16px 8px; }`
- 输入框：`.input-row { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #F3F4F6; }`
- Switch：`width: 44px; height: 24px; background: #D1D5DB; border-radius: 12px;`；激活态 `.switch-on { background: #15803D; }`

---

## Task 5: 创建帮助与反馈页面

**Files:** 创建: `caretaker-app/src/pages/caretaker-help/index.vue`

- [ ] **Step 1: 编写页面代码**

**Template:**
- 顶部 header 同上，标题「帮助与反馈」
- FAQ 区：5 条折叠，点击展开/收起（单条展开），使用 `v-show` 控制
- 提交反馈区：textarea（200字）+ 电话输入框 + 提交按钮
- 联系方式区：客服热线（点击复制）+ 微信公众号（点击复制）

**Script:**
- `expandedFaq` ref 初始 `-1`（全部收起），点击 toggle
- `feedbackText` 和 `feedbackPhone` refs
- `submitFeedback()`: `showToast('反馈已提交')` 并清空表单
- `copyText(text)`: `uni.setClipboardData({ data: text, success: () => uni.showToast({ title: '已复制' }) })`

**Mock FAQ 数据:**
```ts
const faqs = [
  { q: '如何认养田地？', a: '在首页点击田地卡片，选择认养即可。' },
  { q: '忘记密码怎么办？', a: '联系客服重置密码，电话 400-XXX-XXXX。' },
  { q: '如何联系客服？', a: '微信搜索 FarmStar 或拨打 400-XXX-XXXX。' },
  { q: '认养费用如何计算？', a: '根据田地面积和作物类型，每平米每月 X 元。' },
  { q: '养护记录如何查看？', a: '进入田地详情页，点击养护记录tab查看。' },
]
```

**Style:**
- 类名前缀 `.help-`
- FAQ 项：`.faq-item { border-bottom: 1px solid #F3F4F6; }`
- FAQ 问题行：`.faq-q { display: flex; justify-content: space-between; padding: 14px 16px; font-size: 15px; cursor: pointer; }`
- FAQ 答案：`.faq-a { padding: 0 16px 14px; font-size: 14px; color: #6B766B; }`
- 联系方式卡：`.contact-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; }`

---

## Task 6: 更新 Profile 页面菜单跳转

**Files:** 修改: `caretaker-app/src/pages/caretaker-profile/index.vue`

- [ ] **Step 1: 找到三个菜单项的 `@click`，替换为 `void 0` 为实际跳转**

养护统计行：
```html
<view class="menu-item" @click="uni.navigateTo({ url: '/pages/caretaker-stats/index' })">
```

设置行：
```html
<view class="menu-item" @click="uni.navigateTo({ url: '/pages/caretaker-settings/index' })">
```

帮助与反馈行：
```html
<view class="menu-item" @click="uni.navigateTo({ url: '/pages/caretaker-help/index' })">
```

---

## 验证步骤

全部完成后执行以下验证：

1. `cd caretaker-app && npm run dev` 确认无编译错误
2. 浏览器打开 `http://localhost:5174/pages/caretaker-profile/index`
3. 点击「养护统计」→ 应显示统计数字和养护记录列表
4. 点击「设置」→ 应显示个人信息表单和开关
5. 点击「帮助与反馈」→ 应显示 FAQ 折叠和反馈表单
6. 各页返回按钮应正常工作
