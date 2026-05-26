# FarmStar 启动指南

## 前置条件

- Node.js 18+
- npm

## 安装依赖

```bash
npm install
```

## 启动后端 API

```bash
npm run dev:server
```

默认监听 `http://127.0.0.1:3000`，可通过环境变量覆盖：

```bash
PORT=4000 HOST=0.0.0.0 npm run dev:server
```

认养数据持久化到 `.data/adoptions.json`（已 gitignore），可通过环境变量指定路径：

```bash
ADOPTION_STORAGE_PATH=./my-data/adoptions.json npm run dev:server
```

## 启动 H5 前端

```bash
npm run dev:h5
```

默认监听 `http://localhost:5173`，浏览器访问即可。

## 同时启动前后端

开两个终端分别运行，或用后台方式：

```bash
nohup npm run dev:server > /tmp/farmstar-server.log 2>&1 &
nohup npm run dev:h5 > /tmp/farmstar-h5.log 2>&1 &
```

查看日志：

```bash
tail -f /tmp/farmstar-server.log
tail -f /tmp/farmstar-h5.log
```

停止服务：

```bash
for port in 3000 5173; do lsof -ti -iTCP:$port -sTCP:LISTEN | xargs -r kill; done
```

## 运行测试

```bash
npm test
```

## 构建 H5

```bash
npm run build:h5
```

产出目录 `dist/build/h5`。
