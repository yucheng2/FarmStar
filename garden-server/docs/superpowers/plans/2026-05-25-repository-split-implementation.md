# FarmStar 仓库拆分实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan. 仓库拆分是文件操作任务，非 TDD 实现任务，Task 内无 TDD 步骤。

**目标：** 将根目录 `farmstar-garden` 拆分为 garden-web 和 garden-server 两个独立 git 仓库，保留完整提交历史。

**架构：** 每个新仓库 clone FarmStar 后用 `git filter-branch` 过滤出各自目录的提交历史，各自拥有独立 package.json。

---

## 文件结构

```
yuchengfan/dev/personal/
├── caretaker-app/          ← 不动
├── garden-web/            ← 新仓库（保留 src/ tests/ docs/ garden 相关历史）
│   ├── src/
│   ├── tests/
│   ├── docs/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
└── garden-server/         ← 新仓库（保留 server/ 历史）
    ├── server/
    ├── package.json
    └── tsconfig.json
```

---

## Task 1: 创建 garden-web 仓库

**目标：** 在 `/Users/yuchengfan/dev/personal/garden-web` 建立新仓库，分离 src/ tests/ docs/ 的历史

- [ ] **Step 1: 克隆 FarmStar 到临时目录**

```bash
cd /Users/yuchengfan/dev/personal
git clone --no-hardlinks file:///Users/yuchengfan/dev/personal/FarmStar/.git garden-web-tmp
```

- [ ] **Step 2: 在临时目录过滤历史，只保留 src/ tests/ docs/ 和根配置文件**

```bash
cd garden-web-tmp
git filter-branch --force --tree-filter '
  rm -rf server/
  rm -rf caretaker-app/
  rm -rf .playwright-cli/
  rm -rf .claude/
  rm -rf .agents/
  rm -rf .gstack/
  rm -rf .idea/
  rm -rf .data/
  rm -rf .worktrees/
  rm -rf dist/
  rm -rf node_modules/
  rm -rf skills-lock.json
  rm -f TODO.md
  rm -f CLAUDE.md
' --prune-empty -- --all
```

- [ ] **Step 3: 移动过滤后的仓库到 garden-web**

```bash
cd ..
rm -rf garden-web
mv garden-web-tmp garden-web
```

- [ ] **Step 4: 创建独立 package.json**

在 garden-web/ 目录下创建 package.json（见下方内容）

- [ ] **Step 5: 创建 .gitignore**

```
node_modules/
dist/
unpackage/
*.local
```

- [ ] **Step 6: 提交**

```bash
cd garden-web
git add .
git commit -m "Initial commit: garden-web (history from FarmStar)"
```

---

## Task 2: 创建 garden-server 仓库

**目标：** 在 `/Users/yuchengfan/dev/personal/garden-server` 建立新仓库，分离 server/ 的历史

- [ ] **Step 1: 克隆 FarmStar 到临时目录**

```bash
cd /Users/yuchengfan/dev/personal
git clone --no-hardlinks file:///Users/yuchengfan/dev/personal/FarmStar/.git garden-server-tmp
```

- [ ] **Step 2: 在临时目录过滤历史，只保留 server/ 和根配置文件**

```bash
cd garden-server-tmp
git filter-branch --force --tree-filter '
  rm -rf src/
  rm -rf tests/
  rm -rf caretaker-app/
  rm -rf .playwright-cli/
  rm -rf .claude/
  rm -rf .agents/
  rm -rf .gstack/
  rm -rf .idea/
  rm -rf .data/
  rm -rf .worktrees/
  rm -rf dist/
  rm -rf node_modules/
  rm -rf skills-lock.json
  rm -f TODO.md
  rm -f CLAUDE.md
  rm -f index.html
  rm -f vite.config.ts
  rm -f tsconfig.json
' --prune-empty -- --all
```

- [ ] **Step 3: 移动过滤后的仓库到 garden-server**

```bash
cd ..
rm -rf garden-server
mv garden-server-tmp garden-server
```

- [ ] **Step 4: 创建独立 package.json**

```json
{
  "name": "garden-server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx server/index.ts",
    "start": "tsx server/index.ts"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "better-sqlite3": "^12.10.0",
    "fastify": "^5.8.5",
    "jsonwebtoken": "^9.0.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/better-sqlite3": "^7.6.13",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^25.9.1",
    "tsx": "^4.22.3",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 5: 创建 .gitignore**

```
node_modules/
*.local
```

- [ ] **Step 6: 提交**

```bash
cd garden-server
git add .
git commit -m "Initial commit: garden-server (history from FarmStar)"
```

---

## Task 3: 清理 FarmStar 根仓库

**目标：** FarmStar 只保留 caretaker-app 和项目级配置，删除已分离的目录

- [ ] **Step 1: 删除已分离的目录（从 git 跟踪）**

```bash
cd /Users/yuchengfan/dev/personal/FarmStar
git rm -rf src/
git rm -rf server/
git rm -rf tests/
git rm -rf node_modules/
git rm -rf dist/
git rm -rf package-lock.json
git rm -f index.html
git rm -f vite.config.ts
git rm -f tsconfig.json
git rm -f package.json
git rm -f TODO.md
```

- [ ] **Step 2: 更新 .gitignore，移除已不相关的规则**

确保 .gitignore 不引用 src/ server/ tests/ node_modules/ 等

- [ ] **Step 3: 提交清理**

```bash
git add .
git commit -m "chore: remove separated garden-web and garden-server dirs"
```

---

## garden-web package.json 内容

```json
{
  "name": "garden-web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev:h5": "uni -p h5",
    "build:h5": "uni build -p h5",
    "test": "vitest run"
  },
  "dependencies": {
    "@dcloudio/uni-app": "3.0.0-alpha-5010120260519001",
    "@dcloudio/uni-h5": "3.0.0-alpha-5010120260519001",
    "@dcloudio/uni-mp-alipay": "3.0.0-alpha-5010120260519001",
    "@dcloudio/uni-mp-weixin": "3.0.0-alpha-5010120260519001",
    "@dcloudio/uni-ui": "latest",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@dcloudio/types": "latest",
    "@dcloudio/uni-cli-shared": "3.0.0-alpha-5010120260519001",
    "@dcloudio/vite-plugin-uni": "3.0.0-alpha-5010120260519001",
    "@tailwindcss/vite": "^4.3.0",
    "@types/node": "^25.9.1",
    "@vitejs/plugin-vue": "latest",
    "@vue/test-utils": "^2.4.6",
    "autoprefixer": "^10.5.0",
    "jsdom": "^24.1.1",
    "postcss": "^8.5.15",
    "tailwindcss": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "5.2.8",
    "vitest": "^2.1.0",
    "vue-tsc": "^2.1.0"
  }
}
```

---

## 验证步骤

1. `cd garden-web && npm install && npm run dev:h5` — 前端正常启动
2. `cd garden-server && npm install && npm run dev` — 后端正常启动
3. FarmStar 只剩 caretaker-app 目录，运行正常
