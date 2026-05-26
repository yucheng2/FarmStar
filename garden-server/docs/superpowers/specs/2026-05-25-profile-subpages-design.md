# 养护员个人中心子页面设计

## 概述

在 `caretaker-profile`（个人中心）页面现有入口基础上，新建三个子页面：养护统计、设置、帮助与反馈。采用独立页面架构，遵循项目现有样式规范（Flex 布局、绿色渐变 header、无 scoped 冲突）。

---

## 1. 养护统计页面 `/pages/caretaker-stats/index`

### 路由注册
```json
{ "path": "pages/caretaker-stats/index", "style": { "navigationBarTitleText": "养护统计" } }
```

### 页面结构

**顶部导航栏**
- 背景：`#15803D` 纯色
- 左侧：返回按钮（点击 `uni.navigateBack()`）
- 中间：标题「养护统计」

**数据统计区**（白底，间距 16px）
- 四个数字卡片横向排列（flex: 1，等宽）
- 每个卡片：数字（绿色，24px 加粗）+ 标签（灰色，12px）
- 指标：本周养护次数、本月养护次数、负责田地数、完成任务数

**认养数据区**（白底卡片）
- 三个指标横向排列：认养用户数（橙色）、认养总收入（橙色）、累计养护天数（绿色）
- 数字 22px 加粗，标签 12px 灰色

**养护记录列表**（白底卡片）
- 按时间倒序，每条记录：
  - 左侧：动作图标（🌱浇水 🌿除草 🔍巡检）
  - 中间：田地名称 + 养护员姓名
  - 右侧：相对时间（今天/昨天/X天前）
- 点击跳转到 `/pages/caretaker-field/index?field_id=xxx`

### Mock 数据
- `caretakerStats`：`{ weeklyCount: 12, monthlyCount: 45, fieldCount: 8, completedCount: 38 }`
- `adoptionStats`：`{ userCount: 24, totalIncome: 3600, careDays: 180 }`
- `careLogList`：复用 `careLogs` mock 数据，按时间排序

---

## 2. 设置页面 `/pages/caretaker-settings/index`

### 路由注册
```json
{ "path": "pages/caretaker-settings/index", "style": { "navigationBarTitleText": "设置" } }
```

### 页面结构

**顶部导航栏**
- 背景：`#15803D`
- 左侧：返回按钮
- 中间：标题「设置」

**个人信息区**（白底卡片，分组标题「个人信息」）
- 头像：圆形 64px，点击弹出 Toast「头像功能开发中」（暂不实现图片选择）
- 姓名：单行输入框，默认值来自 `getCareTakerInfo().name`
- 电话：单行输入框，默认值来自 `getCareTakerInfo().phone`
- 村庄：单行输入框，默认值来自 `getCareTakerInfo().village`

**通知设置区**（白底卡片，分组标题「通知设置」）
- 三行开关卡片：浇水提醒、除草提醒、采收提醒
- 开关：右侧 Toggle，激活态为绿色 `#15803D`，默认全部打开

**账号安全区**（白底卡片，分组标题「账号安全」）
- 修改密码按钮：整行可点击，点击弹出 `showModal` 输入框（Mock）

---

## 3. 帮助与反馈页面 `/pages/caretaker-help/index`

### 路由注册
```json
{ "path": "pages/caretaker-help/index", "style": { "navigationBarTitleText": "帮助与反馈" } }
```

### 页面结构

**顶部导航栏**
- 背景：`#15803D`
- 左侧：返回按钮
- 中间：标题「帮助与反馈」

**FAQ 区**（白底卡片，分组标题「常见问题」）
- 3-5 条折叠面板，点击展开/收起，同时只展开一条
- 问题示例：
  - 如何认养田地？
  - 忘记密码怎么办？
  - 如何联系客服？
  - 认养费用如何计算？
  - 养护记录如何查看？

**提交反馈区**（白底卡片，分组标题「提交反馈」）
- 文本框：placeholder「请描述您的问题」，最多 200 字
- 联系电话：输入框，placeholder「请输入手机号（选填）」
- 提交按钮：整行绿色按钮，点击 Toast「反馈已提交」

**联系方式区**（白底卡片，分组标题「联系我们」）
- 客服热线：400-XXX-XXXX（点击复制到剪贴板）
- 微信公众号：FarmStar（点击 Toast「微信号已复制」）

---

## 通用设计规范

- 所有页面 `<style>` 不加 `scoped`，使用页面前缀类名（如 `.stats-header`、`.settings-section`）避免全局 CSS 冲突
- Header：`background: #15803D; padding: 48px 16px 16px; color: white`
- 卡片：`background: white; border-radius: 12px; padding: 16px; margin: 0 16px 12px`
- 分组标题：14px 灰色文字，左侧边距同内容
- 返回按钮：Unicode 箭头 `‹` 或 SVG chevron，font-size 24px

---

## 入口对接

`caretaker-profile/index.vue` 菜单项点击跳转：

```ts
// 养护统计
uni.navigateTo({ url: '/pages/caretaker-stats/index' })
// 设置
uni.navigateTo({ url: '/pages/caretaker-settings/index' })
// 帮助与反馈
uni.navigateTo({ url: '/pages/caretaker-help/index' })
```

---

## 文件清单

新建：
- `caretaker-app/src/pages/caretaker-stats/index.vue`
- `caretaker-app/src/pages/caretaker-settings/index.vue`
- `caretaker-app/src/pages/caretaker-help/index.vue`

修改：
- `caretaker-app/src/pages.json`（注册三个新路由）
- `caretaker-app/src/pages/caretaker-profile/index.vue`（菜单项跳转）
