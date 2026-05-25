# FarmStar 地图视图 Leaflet 迁移实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 H5 地图从腾讯 TMap 迁移到 Leaflet + OpenStreetMap，解决地图白屏问题

**Architecture:** H5 端使用 Leaflet 替代 TMap，移除对腾讯地图 API Key 的依赖。保留微信/支付宝小程序原生地图组件不变。

**Tech Stack:** Leaflet, OpenStreetMap, TypeScript, Vue 3

---

## 文件变更概览

| 文件 | 变更类型 | 描述 |
|------|----------|------|
| `package.json` | 修改 | 添加 leaflet 依赖 |
| `index.html` | 修改 | 移除腾讯地图 JS，添加 Leaflet CSS |
| `src/components/FieldMapView.vue` | 修改 | 重写 H5 地图逻辑 |

---

## Task 1: 安装 Leaflet 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 添加 leaflet 依赖**

```bash
cd /Users/yuchengfan/dev/personal/FarmStar && npm install leaflet @types/leaflet
```

验证安装成功：
```bash
ls node_modules/leaflet/
```

---

## Task 2: 修改 index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 替换腾讯地图引入为 Leaflet CSS**

编辑 `/Users/yuchengfan/dev/personal/FarmStar/index.html`，将：

```html
<!-- 腾讯地图 JS API -->
<script src="https://map.qq.com/api/gljs?v=1.exp&key=YOUR_TENCENT_MAP_KEY"></script>
```

替换为：

```html
<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
```

---

## Task 3: 重写 FieldMapView.vue H5 地图逻辑

**Files:**
- Modify: `src/components/FieldMapView.vue`

- [ ] **Step 1: 替换 TMap 逻辑为 Leaflet**

编辑 `/Users/yuchengfan/dev/personal/FarmStar/src/components/FieldMapView.vue`：

**删除以下代码（约91-156行）：**
```typescript
// H5 地图相关
const mapContainer = ref<HTMLDivElement | null>(null)
let h5Map: any = null

function initH5Map() {
  if (typeof window === 'undefined' || !(window as any).TMap) return

  const TMap = (window as any).TMap
  // ... TMap 相关代码
}
```

**替换为 Leaflet 实现：**
```typescript
// H5 地图相关 (Leaflet)
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainer = ref<HTMLDivElement | null>(null)
let h5Map: L.Map | null = null

function initH5Map() {
  if (typeof window === 'undefined' || !mapContainer.value) return

  // 如果已经初始化过，先销毁
  if (h5Map) {
    h5Map.remove()
    h5Map = null
  }

  h5Map = L.map(mapContainer.value, {
    center: [center.value.latitude, center.value.longitude],
    zoom: scale.value,
    zoomControl: true
  })

  // 添加 OpenStreetMap 瓦片层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(h5Map)

  // 添加标记点
  mapFields.value.forEach((field) => {
    if (!field.location) return

    const color = statusColor(field.status)
    const marker = L.circleMarker([field.location.latitude, field.location.longitude], {
      radius: 12,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1
    })

    marker.bindPopup(`
      <div style="min-width: 120px;">
        <strong style="font-size: 14px; color: #14532D;">${field.name}</strong>
        <div style="font-size: 12px; color: #64748B; margin-top: 4px;">
          ${field.status === 'idle' ? '可认养' : field.status === 'adopted' ? '已认养' : field.status === 'ready_to_harvest' ? '待收获' : '维护中'}
        </div>
        <div style="font-size: 11px; color: #64748B; margin-top: 2px;">面积: ${field.areaSquareMeters}㎡</div>
      </div>
    `)

    marker.on('click', () => {
      emit('markerTap', field)
    })

    marker.addTo(h5Map!)
  })
}

function destroyH5Map() {
  if (h5Map) {
    h5Map.remove()
    h5Map = null
  }
}
```

- [ ] **Step 2: 更新 onMounted 逻辑**

将 onMounted 中的检查 TMap 改为直接初始化 Leaflet：

```typescript
onMounted(() => {
  // 等待 DOM 就绪后初始化 Leaflet
  if (typeof window !== 'undefined' && mapContainer.value) {
    // 延迟一点确保 DOM 完全渲染
    setTimeout(() => {
      initH5Map()
    }, 100)
  }
})
```

- [ ] **Step 3: 移除 H5 模拟地图相关代码**

删除 `h5Markers` computed 属性（158-178行）和 `mapLoadFailed` ref（180行），因为 Leaflet 会自动处理加载失败。

---

## Task 4: 验证和测试

- [ ] **Step 1: 启动开发服务器**

```bash
cd /Users/yuchengfan/dev/personal/FarmStar && npm run dev:h5
```

- [ ] **Step 2: 验证 H5 地图显示**

在浏览器中打开，检查：
1. 地图瓦片是否正常加载（应显示 OpenStreetMap 底图）
2. 田地标记点是否显示（彩色圆点）
3. 点击标记是否弹出信息窗口

- [ ] **Step 3: 验证切换视图**

在田园页面切换"列表视图"和"地图视图"，确认切换正常。

---

## Task 5: 提交变更

```bash
git add package.json index.html src/components/FieldMapView.vue
git commit -m "feat: migrate H5 map from TMap to Leaflet + OSM"
```

---

## 验证清单

- [ ] H5 端地图能正常显示 OpenStreetMap 底图
- [ ] 田地标记点正确显示在地图上
- [ ] 点击标记点能触发 `markerTap` 事件并弹出田地详情
- [ ] 地图加载失败时有 fallback 机制（模拟地图）
- [ ] 小程序端地图组件不受影响
- [ ] 图例正确显示所有状态颜色
