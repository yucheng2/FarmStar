# FarmStar 田园板块设计规格

日期：2026-05-23

## 1. 整体架构与模块边界

采用前后端一体化 MVP，先完成“用户可浏览田地 → 查看管护员 → 选择管护员 → 绑定认养 → 支付前跳转 → 后台可维护形象”的闭环。

前端分为 4 个核心页面/区域：

1. 田园主界面
   - 列表视图为 MVP 默认实现，地图视图先保留入口与空状态/占位能力。
   - 支持田地状态展示、搜索、筛选、点击头像查看管护员详情、点击“立即认养/查看详情”。

2. 选择管护员页面
   - 展示“系统推荐”和“全部管护员”两个横向滚动区域。
   - 支持单选高亮、点击详情、确认选择。
   - 推荐规则在后端完成，前端只消费排序后的列表。

3. 管护员详情弹窗
   - 在田园主界面和选择管护员页面复用。
   - 展示真人照片与二次元形象对比、基础信息、评分、近 30 天数据，以及“负责的田地/联系管护员/关闭”。

4. 管理后台形象管理
   - MVP 覆盖上传真人照片、上传二次元头像、填写管护员信息、绑定田地、编辑、删除。
   - 批量绑定和导出作为后台二期能力，先在接口和数据模型上预留但不优先实现复杂 UI。

后端分为 5 个领域模块：

1. `fields`：田地信息、状态、作物、生长进度、预计收获时间。
2. `caretakers`：管护员信息、评分、经验、擅长作物、头像/真人照片。
3. `adoptions`：认养记录、田地与管护员绑定、支付前订单状态。
4. `caretaker_changes`：更换申请、审核状态、更换次数限制。
5. `assets`：图片上传、裁剪结果、WebP 地址、缓存元信息。

关键边界：

- 前端不展示手机号、身份证号等隐私字段，这些字段只允许后台受权限控制查看。
- 管护员推荐由后端计算，避免多端逻辑不一致。
- 图片统一走资产模块，前端只使用压缩后的 WebP URL。
- 埋点在前端触发，后端接收或转发，MVP 至少覆盖 PRD 中 5 个事件。

## 2. 页面与交互设计

### 2.1 田园主界面

默认进入列表视图，页面结构为：

- 顶部导航：返回、标题“我的田园”、搜索、筛选。
- 视图切换：`列表视图 / 地图视图`。
- 田地卡片列表：每张卡片展示田地名、面积、状态、作物、生长进度、预计收获时间、管护员头像和操作按钮。

田地状态分为：

- `idle`：空闲，按钮显示“立即认养”。
- `adopted`：已认养，按钮显示“查看详情”。
- `ready_to_harvest`：待收获，按钮显示“查看详情”，状态标签使用丰收黄强调。
- `maintenance`：维护中，MVP 可展示但不可认养，按钮置灰。

交互规则：

- 点击田地卡片：进入田地详情页，MVP 可先实现为详情页面或详情弹层，具体按现有路由结构决定。
- 点击“立即认养”：进入选择管护员页面，并携带 `field_id`。
- 点击“查看详情”：进入田地详情。
- 点击管护员头像：打开管护员详情弹窗。
- 点击搜索：展开搜索框，支持田地编号、作物名称、管护员姓名。
- 点击筛选：打开筛选面板，支持状态、作物类型、管护员评分。

地图视图：

- MVP 阶段保留 tab 和空状态提示：“地图视图即将开放”。
- 如果项目已有地图能力，可以在后续计划中纳入，否则不阻塞主闭环。

### 2.2 选择管护员页面

页面由三块组成：

1. 系统推荐
   - 标题显示“系统推荐（3公里内）”。
   - 后端返回 3-5 名管护员。
   - 横向滚动展示头像、姓名、评分、距离/经验摘要。

2. 全部管护员
   - 支持横向或分页列表加载。
   - MVP 优先横向滚动 + “加载更多”。
   - 支持评分、经验、擅长作物筛选。

3. 底部确认栏
   - 未选择时按钮禁用。
   - 选择后按钮显示“确认选择”。
   - 点击后调用绑定接口，成功后跳转支付页面或支付前确认页。

头像交互：

- 单击：选中并高亮绿色边框。
- 再次单击已选头像：保持选中，不取消，避免误操作。
- 查看详情入口使用头像旁的“详情”或长按/双击二选一。MVP 不使用双击作为唯一入口，因为小程序端双击可发现性较差。

### 2.3 管护员详情弹窗

弹窗宽度为屏幕 80%，内容自适应高度。

展示内容：

- 顶部：真人照片与二次元形象对比。
- 中部：姓名、年龄、村庄、经验、擅长作物、评分、评价数、近 30 天完成数、好评率。
- 底部按钮：
  - “负责的田地”：跳转到筛选后的田地列表。
  - “联系管护员”：跳转内置聊天；若聊天模块未就绪，MVP 显示“暂未开放”。
  - “关闭”。

### 2.4 更换管护员

入口位于田地详情页的管护员信息区。

流程：

1. 用户点击“更换管护员”。
2. 系统检查当前认养周期更换次数。
3. 未超过 2 次则进入更换申请页。
4. 用户可填写更换理由。
5. 提交后进入 `pending_review` 状态。
6. 审核通过后，用户重新进入选择管护员页面完成绑定更新。

MVP 建议：

- 用户端实现申请入口与状态展示。
- 审核操作放在后台。
- 更换后立即更新田地详情中的管护员信息。

### 2.5 管理后台形象管理

MVP 页面包括：

- 管护员列表：姓名、村庄、评分、头像状态、绑定田地数、操作。
- 新增/编辑管护员：基础信息、真人照片、二次元头像、擅长作物、经验年限。
- 图片上传：上传后裁剪为标准比例，保存 WebP 结果。
- 绑定田地：选择一个或多个空闲/可分配田地绑定给管护员。
- 删除：仅允许删除未绑定有效认养中的管护员形象；已绑定记录应改为停用。

## 3. 数据模型与接口设计

### 3.1 核心数据模型

`Field` 田地：

```ts
type Field = {
  id: string
  code: string
  name: string
  areaSquareMeters: number
  status: 'idle' | 'adopted' | 'ready_to_harvest' | 'maintenance'
  crop?: {
    id: string
    name: string
    iconUrl: string
    progressPercent: number
  }
  expectedHarvestDate?: string
  caretaker?: CaretakerSummary
}
```

`Caretaker` 管护员：

```ts
type Caretaker = {
  id: string
  name: string
  age: number
  village: string
  experienceYears: number
  specialties: string[]
  rating: number
  reviewCount: number
  completedAdoptionsLast30Days: number
  positiveRate: number
  avatarUrl: string
  realPhotoUrl: string
  distanceKm?: number
  status: 'active' | 'inactive'
}
```

`Adoption` 认养记录：

```ts
type Adoption = {
  id: string
  userId: string
  fieldId: string
  caretakerId: string
  status: 'pending_payment' | 'active' | 'completed' | 'cancelled'
  paymentOrderId?: string
  createdAt: string
}
```

`CaretakerChangeRequest` 更换申请：

```ts
type CaretakerChangeRequest = {
  id: string
  adoptionId: string
  oldCaretakerId: string
  newCaretakerId?: string
  reason?: string
  status: 'pending_review' | 'approved' | 'rejected' | 'completed'
  cycleChangeCount: number
  createdAt: string
}
```

`Asset` 图片资产：

```ts
type Asset = {
  id: string
  ownerType: 'caretaker_real_photo' | 'caretaker_avatar'
  ownerId?: string
  url: string
  mimeType: 'image/webp'
  sizeBytes: number
  width: number
  height: number
  cacheTtlDays: 7
  createdAt: string
}
```

### 3.2 用户端 REST API

田地列表：

```http
GET /api/fields?view=list&status=idle&crop_type=vegetable&caretaker_rating_min=4.5&keyword=tomato
```

返回：

```ts
{
  items: Field[]
  pagination: {
    nextCursor?: string
  }
}
```

田地详情：

```http
GET /api/fields/{field_id}
```

获取推荐管护员：

```http
GET /api/fields/{field_id}/recommended-caretakers
```

后端规则：

- 只返回距离田地 3km 内的 active 管护员。
- 默认返回 3-5 名。
- 排序：综合评分 > 管护经验 > 好评率 > 距离。
- 如果 3km 内不足 3 名，返回实际数量并附带提示字段。

全部管护员：

```http
GET /api/caretakers?rating_min=4.5&experience_range=5_plus&specialty=vegetable&cursor=cursor_001
```

管护员详情：

```http
GET /api/caretakers/{caretaker_id}
```

创建认养并绑定管护员：

```http
POST /api/adoptions
Content-Type: application/json

{
  "field_id": "field_001",
  "caretaker_id": "caretaker_001"
}
```

返回：

```ts
{
  adoption_id: string
  status: 'pending_payment'
  payment_order_id: string
  next_url: string
}
```

提交更换申请：

```http
POST /api/adoptions/{adoption_id}/caretaker-change-requests
Content-Type: application/json

{
  "reason": "沟通不及时"
}
```

查询更换申请状态：

```http
GET /api/adoptions/{adoption_id}/caretaker-change-request
```

审核通过后选择新管护员：

```http
POST /api/caretaker-change-requests/{request_id}/complete
Content-Type: application/json

{
  "new_caretaker_id": "caretaker_002"
}
```

埋点上报：

```http
POST /api/analytics/events
Content-Type: application/json

{
  "event": "caretaker_click",
  "user_id": "user_001",
  "caretaker_id": "caretaker_001",
  "timestamp": "2026-05-23T10:00:00+08:00"
}
```

### 3.3 后台 REST API

创建/编辑管护员：

```http
POST /api/admin/caretakers
PUT /api/admin/caretakers/{caretaker_id}
```

上传图片资产：

```http
POST /api/admin/assets
Content-Type: multipart/form-data
```

后端处理：

- 校验图片类型和大小。
- 裁剪或接收前端裁剪后的标准尺寸。
- 转换为 WebP。
- 压缩至 100KB 以下。
- 返回 `Asset`。

绑定管护员与田地：

```http
POST /api/admin/caretakers/{caretaker_id}/fields
Content-Type: application/json

{
  "field_ids": ["field_001", "field_002"]
}
```

审核更换申请：

```http
POST /api/admin/caretaker-change-requests/{request_id}/review
Content-Type: application/json

{
  "decision": "approved",
  "comment": "同意更换"
}
```

删除/停用管护员：

```http
DELETE /api/admin/caretakers/{caretaker_id}
```

规则：

- 若管护员没有有效认养或待处理更换记录，可删除。
- 若存在历史业务记录，执行停用，保留审计数据。

### 3.4 字段安全与隐私

用户端接口不返回：

- 手机号
- 身份证号
- 家庭住址
- 内部备注
- 后台审核记录明细

后台接口需要权限控制：

- `admin.caretaker.read`
- `admin.caretaker.write`
- `admin.asset.write`
- `admin.change_request.review`

## 4. 关键流程、异常处理与埋点设计

### 4.1 浏览田地流程

流程：

1. 用户进入田园板块。
2. 前端触发 `page_view`。
3. 调用 `GET /api/fields` 拉取田地列表。
4. 渲染田地卡片。
5. 图片使用懒加载，优先加载首屏田地和管护员头像。
6. 用户可搜索、筛选或切换视图。

异常处理：

- 田地列表加载失败：展示重试按钮。
- 空列表：展示“暂无符合条件的田地”。
- 图片加载失败：使用默认二次元农民头像占位。
- 地图视图未开放：展示说明，不报错。

### 4.2 查看管护员详情流程

流程：

1. 用户点击管护员头像。
2. 前端触发 `caretaker_click`。
3. 调用 `GET /api/caretakers/{caretaker_id}`。
4. 弹出详情弹窗。
5. 弹窗曝光后触发 `caretaker_detail_view`。
6. 用户可查看负责田地或联系管护员。

异常处理：

- 管护员详情加载失败：弹窗内展示“加载失败，请重试”。
- 真人照片或二次元头像缺失：对应位置显示占位图。
- 管护员已停用：仍可展示历史信息，但不允许被选择。
- 聊天模块未开放：点击“联系管护员”时展示“功能暂未开放”。

### 4.3 选择管护员并创建认养流程

流程：

1. 用户点击空闲田地的“立即认养”。
2. 前端进入选择管护员页面，携带 `field_id`。
3. 并行请求：
   - `GET /api/fields/{field_id}/recommended-caretakers`
   - `GET /api/caretakers`
4. 用户选择管护员，前端触发 `caretaker_select`。
5. 点击“确认选择”。
6. 调用 `POST /api/adoptions`。
7. 后端校验田地仍为空闲、管护员可用、用户可认养。
8. 创建 `pending_payment` 认养记录和支付单。
9. 前端跳转 `next_url` 或支付前确认页。

异常处理：

- 田地已被他人认养：提示“该田地已被认养，请选择其他田地”，返回田园列表并刷新。
- 管护员不可用：提示并刷新推荐列表。
- 推荐管护员不足 3 名：显示实际数量，不阻断流程。
- 创建认养失败：保留当前选择，允许重试。
- 支付单创建失败：认养记录不进入 active，提示稍后重试。

### 4.4 更换管护员流程

流程：

1. 用户在田地详情点击“更换管护员”。
2. 前端调用田地/认养详情，读取当前周期更换次数。
3. 若次数小于 2，展示更换申请表单。
4. 用户提交原因，触发 `caretaker_change`，其中 `new_caretaker_id` 在申请阶段为空或不传。
5. 后端创建 `pending_review` 申请。
6. 后台审核通过。
7. 用户重新进入选择管护员页面。
8. 调用 `POST /api/caretaker-change-requests/{request_id}/complete` 完成新管护员绑定。
9. 更新田地详情与认养记录。

异常处理：

- 已达到 2 次限制：隐藏或禁用更换入口，展示“本周期更换次数已用完”。
- 存在待审核申请：不允许重复提交。
- 审核被拒绝：展示拒绝状态，保留当前管护员。
- 新管护员已不可用：要求重新选择。
- 原管护员历史记录保留，不覆盖审计链路。

### 4.5 后台形象管理流程

流程：

1. 管理员新增管护员。
2. 上传真人照片和二次元头像。
3. 图片资产服务转换为 WebP 并压缩。
4. 管理员填写基础信息。
5. 绑定负责田地。
6. 保存后用户端可见。

异常处理：

- 图片超过限制：提示压缩或重新上传。
- 非图片/非允许格式：拒绝上传。
- WebP 转换失败：提示重新上传。
- 绑定田地已被有效认养占用：禁止绑定。
- 删除有历史业务记录的管护员：改为停用。

### 4.6 埋点设计

MVP 覆盖 PRD 中 5 个事件：

| 事件 | 触发时机 | 必传参数 |
|---|---|---|
| `page_view` | 进入田园板块首屏 | `user_id`, `page_name`, `timestamp` |
| `caretaker_click` | 点击头像 | `user_id`, `caretaker_id`, `timestamp` |
| `caretaker_detail_view` | 详情弹窗成功展示 | `user_id`, `caretaker_id`, `timestamp` |
| `caretaker_select` | 选择管护员 | `user_id`, `caretaker_id`, `field_id`, `timestamp` |
| `caretaker_change` | 提交更换申请 | `user_id`, `old_caretaker_id`, `new_caretaker_id?`, `reason?`, `timestamp` |

埋点失败不阻断主流程，前端可本地短暂缓存并重试，但不需要复杂离线队列作为 MVP 范围。

## 5. 测试、验收与分阶段范围

### 5.1 MVP 范围

MVP 必须完成：

- 田园主界面列表视图。
- 搜索与基础筛选。
- 田地卡片状态、作物、进度、预计收获时间展示。
- 管护员头像展示、详情弹窗。
- 选择管护员页面。
- 系统推荐与全部管护员列表。
- 创建认养并跳转支付前流程。
- 更换管护员申请、后台审核、审核后重新选择。
- 后台管护员形象上传、编辑、绑定、停用。
- WebP 图片处理与前端懒加载。
- PRD 中 5 个埋点事件。
- 用户端隐私字段不展示。

MVP 暂缓：

- 地图视图完整实现。
- 管护员排行榜首页模块。
- 批量绑定复杂交互。
- 图片导出列表。
- 复杂离线埋点队列。
- 聊天模块真实接入；可先做跳转占位。

### 5.2 前端测试重点

页面状态：

- 田地列表加载成功、失败、空列表。
- 不同田地状态按钮与标签正确。
- 搜索/筛选条件能正确传给接口。
- 地图 tab 未开放时显示占位。

交互：

- 点击头像打开详情弹窗。
- 管护员横向滚动流畅。
- 选择管护员后绿色高亮。
- 未选择时确认按钮禁用。
- 创建认养成功后跳转支付前页面。
- 创建失败时保留用户当前选择。

兼容性：

- iOS 12+、Android 8+。
- 微信小程序、支付宝小程序、APP 端。
- 不同屏幕宽度下卡片、头像、弹窗不溢出。

性能：

- 首屏加载目标不超过 2 秒。
- 横向滚动不卡顿。
- 图片懒加载生效。
- 页面内存不超过 100MB。

### 5.3 后端测试重点

接口：

- 田地列表筛选、搜索、分页。
- 管护员推荐严格限制 3km 范围。
- 推荐排序符合评分 > 经验 > 好评率 > 距离。
- 创建认养时防止并发认养同一田地。
- 管护员停用后不能被新选择。
- 更换次数每个认养周期最多 2 次。
- 存在待审核申请时不能重复提交。
- 删除有历史记录的管护员转为停用。

安全：

- 用户端接口不返回手机号、身份证号等隐私字段。
- 后台接口必须校验权限。
- 图片上传限制类型、尺寸和大小。
- 图片 URL 不暴露本地存储路径或内部桶信息。

### 5.4 管理后台测试重点

- 新增管护员。
- 编辑基础信息。
- 上传真人照片。
- 上传二次元头像。
- WebP 转换和 100KB 限制。
- 绑定田地。
- 解绑/停用管护员。
- 审核更换申请。
- 处理图片上传失败、绑定冲突、删除受限等异常。

### 5.5 验收标准映射

PRD 的验收标准映射如下：

- 界面验收：由前端页面状态、响应式、头像规格和弹窗布局测试覆盖。
- 功能验收：由田地加载、头像弹窗、横向滚动、推荐规则、绑定流程、更换流程、后台管理测试覆盖。
- 性能验收：由首屏加载、滚动流畅、图片懒加载、内存占用测试覆盖。
- 兼容性验收：由三端和系统版本测试覆盖。
- 安全验收：由隐私字段、后台权限、图片上传限制覆盖。

### 5.6 分阶段交付建议

阶段 1：用户端浏览与详情

- 田园主界面列表。
- 管护员详情弹窗。
- 搜索、筛选、埋点。

阶段 2：认养选择闭环

- 推荐管护员。
- 全部管护员列表。
- 选择管护员。
- 创建认养并跳转支付前流程。

阶段 3：后台形象管理

- 管护员信息维护。
- 图片上传和 WebP 转换。
- 田地绑定。
- 停用规则。

阶段 4：更换管护员

- 用户提交申请。
- 后台审核。
- 审核后重新选择。
- 更换次数限制。

阶段 5：体验增强

- 地图视图。
- 首页排行榜。
- 批量绑定。
- 导出。
- 聊天真实接入。
