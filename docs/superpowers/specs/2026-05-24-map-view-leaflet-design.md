# FarmStar 地图视图 Leaflet 迁移设计

## 概述

将 H5 地图从腾讯 TMap 迁移到 Leaflet + OpenStreetMap，解决地图完全无法显示的问题。

## 现状问题

1. `index.html` 使用占位符 API Key `YOUR_TENCENT_MAP_KEY`，导致 H5 地图白屏
2. 标记点图标 `/static/marker-green.png` 等文件不存在

## 方案

### 技术选型

| 方案 | 优点 | 缺点 |
|------|------|------|
| Leaflet + OSM | 免费、无需 API key、社区活跃 | 国内地图精细度略低 |
| 高德/百度地图 | 国内数据准确 | 需要 API key、有配额限制 |
| 保留 TMap | 已有代码 | 需申请 key |

**推荐：Leaflet + OSM**

### 实现步骤

1. **安装依赖**
   ```bash
   npm install leaflet @types/leaflet
   ```

2. **修改 `index.html`**
   - 移除腾讯地图 JS API 引入
   - 添加 Leaflet CSS

3. **修改 `FieldMapView.vue`**
   - H5 端使用 Leaflet 替代 TMap
   - 移除对静态图标文件的依赖（改用 Leaflet 内置标记样式）
   - 保留 fallback 模拟地图机制
   - 保留小程序原生地图

### 组件变更

**H5 地图 (Leaflet)**
- 使用 `L.map` 创建地图
- 使用 `L.tileLayer` 加载 OSM 瓦片
- 使用 `L.circleMarker` 替代图片标记，显示状态颜色
- 使用 `L.popup` 显示田地信息

**小程序端**
- 保持原有 `<map>` 组件不变
- 修复图标路径问题（使用内置 iconPath 或 Base64）

### 文件变更

| 文件 | 变更 |
|------|------|
| `index.html` | 移除 TMap 引入，添加 Leaflet CSS |
| `src/components/FieldMapView.vue` | 重写 H5 地图逻辑 |
| `package.json` | 添加 leaflet 依赖 |

## 兼容性

- 微信小程序：使用原生地图组件
- H5：使用 Leaflet
- 支付宝小程序：使用原生地图组件
