# FarmStar 智慧农业管理平台

FarmStar 是一个现代化的农业管理平台，提供地块监控、养护日志、设备扫描等核心功能。平台采用多仓库架构，分别针对养护人员、WEB 用户和后端服务进行优化。

## 功能特性

### caretaker-app - 养护人员移动应用
- **首页仪表盘**：查看任务概览、统计数据和待处理事项
- **地块地图**：使用 Leaflet 实现的可视化地块地图
- **地块管理**：查看和管理负责的农业地块
- **养护日志**：记录和追踪每次养护操作
- **扫码功能**：快速扫描设备二维码获取信息
- **个人中心**：查看和修改个人信息

### garden-web - WEB 端应用
- 基于 Uni-app 的跨平台 WEB 应用
- 支持 H5、小程序等多端运行

### garden-server - 后端 API 服务
- 基于 Fastify 的高性能 Node.js 服务
- SQLite 数据库存储
- JWT 认证机制
- 完整的 RESTful API

## 技术栈

### 前端
- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **样式**：UnoCSS + CSS Variables
- **地图**：Leaflet
- **类型**：TypeScript
- **测试**：Vitest

### 后端
- **框架**：Fastify 5
- **运行时**：Node.js
- **数据库**：SQLite (better-sqlite3)
- **认证**：JWT + bcrypt

## 项目结构

```
FarmStar/
├── caretaker-app/          # 养护人员 H5 移动应用
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 可复用组件
│   │   ├── services/     # API 服务
│   │   ├── composables/   # Vue Composables
│   │   ├── types/        # TypeScript 类型定义
│   │   ├── mocks/        # 模拟数据
│   │   ├── utils/        # 工具函数
│   │   └── styles/       # 全局样式
│   └── package.json
│
├── garden-web/             # Uni-app WEB 应用
│   ├── src/               # 源代码
│   └── package.json
│
├── garden-server/          # 后端 API 服务
│   ├── server/
│   │   ├── database/     # 数据库配置和脚本
│   │   ├── repositories/  # 数据仓库
│   │   ├── app.ts        # 应用入口
│   │   └── index.ts      # 服务器启动
│   ├── src/
│   │   ├── mocks/        # 模拟数据
│   │   └── types/        # 类型定义
│   └── package.json
│
└── docs/                  # 项目文档
    └── superpowers/       # AI 辅助开发计划
```

## 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 1. 克隆项目

```bash
git clone <repository-url>
cd FarmStar
```

### 2. 安装依赖

```bash
# 安装 caretaker-app 依赖
cd caretaker-app
npm install

# 安装 garden-web 依赖 (可选)
cd ../garden-web
npm install

# 安装 garden-server 依赖 (可选)
cd ../garden-server
npm install
```

### 3. 启动开发服务器

#### 养护人员应用 (推荐)

```bash
cd caretaker-app
npm install
npm run dev
```

应用将在 http://localhost:5173 启动。

#### 后端服务

```bash
cd garden-server
npm install
npm run dev
```

API 服务将在 http://localhost:3000 启动。

#### WEB 应用

```bash
cd garden-web
npm install
npm run dev:h5
```

## 开发指南

### caretaking-app 组件规范

1. **布局规则**：仅使用 Flex 布局，不使用 float 或绝对定位
2. **样式变量**：使用 CSS 变量定义主题色
3. **移动优先**：采用移动端优先的响应式设计
4. **组件转换**：使用 uni-app 风格组件（`<view>`, `<text>`, `<image>`）

### 主题颜色

| 变量 | 值 | 用途 |
|------|-----|------|
| `--color-primary` | `#15803D` | 主色调 |
| `--color-background` | `#F0FDF4` | 背景色 |
| `--color-foreground` | `#14532D` | 前景色 |
| `--color-border` | `#BBF7D0` | 边框色 |
| `--color-muted-foreground` | `#6B766B` | 次要文字色 |

### API 模拟

caretaker-app 使用 `src/utils/uni-mock.ts` 模拟 uni-app API，可在浏览器环境下独立开发和测试，无需后端服务。

## 可用脚本

### caretaker-app

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (端口 5173) |
| `npm run build` | 生产环境构建 |
| `npm run test` | 运行 Vitest 测试 |

### garden-web

| 命令 | 说明 |
|------|------|
| `npm run dev:h5` | H5 开发服务器 |
| `npm run build:h5` | H5 生产构建 |
| `npm run test` | 运行 Vitest 测试 |

### garden-server

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Fastify 服务器 (端口 3000) |
| `npm start` | 生产环境启动 |

## License

Private - All rights reserved
