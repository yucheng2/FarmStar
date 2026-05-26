# FarmStar 仓库拆分设计

## 目标

将根目录 `farmstar-garden` 拆分为三个独立仓库：

- `caretaker-app/` — 已有，不动
- `garden-web/` — 新仓库，UniApp web 前端
- `garden-server/` — 新仓库，Fastify 后端

---

## 目标架构

```
yuchengfan/dev/personal/
├── caretaker-app/          ← 不动，已独立
├── garden-web/            ← 新 git 仓库
│   ├── src/              ← UniApp web 前端
│   ├── tests/            ← vitest 测试（login.test.ts）
│   ├── docs/             ← garden web 相关文档
│   ├── package.json      ← UniApp + vitest（不含 fastify）
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
├── garden-server/         ← 新 git 仓库
│   ├── server/           ← Fastify 后端
│   ├── package.json      ← fastify + better-sqlite3 + bcryptjs
│   └── tsconfig.json
└── FarmStar/           ← 仅保留 caretaker-app + 项目级配置
    ├── caretaker-app/
    ├── .playwright-cli/  ← 工具配置，保持不动
    ├── CLAUDE.md         ← 整体项目说明
    ├── .claude/          ← skills 等
    └── skills-lock.json
```

---

## 分离方式

使用 `git subtree split` 按目录分离 commit 历史：

- `garden-web` ← `src/` + `tests/` + `docs/`（garden 相关）+ 根目录配置文件
- `garden-server` ← `server/` + 根目录配置文件

根目录保留 caretaker-app 和项目级配置。

---

## garden-web package.json

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

## garden-server package.json

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

---

## 待处理文件清单

### garden-web（从 FarmStar 移出）
| 文件/目录 | 说明 |
|-----------|------|
| `src/` | UniApp web 前端 |
| `tests/` | vitest 测试（仅 login.test.ts 相关） |
| `docs/` | garden web 相关文档 |
| `index.html` | 入口 HTML |
| `vite.config.ts` | Vite 配置 |
| `tsconfig.json` | TS 配置 |
| `package.json` | 新建，分离依赖 |
| `src/main.ts` | 入口文件 |
| `src/manifest.json` | UniApp manifest |

### garden-server（从 FarmStar 移出）
| 文件/目录 | 说明 |
|-----------|------|
| `server/` | Fastify 后端 |
| `package.json` | 新建，仅 fastify 相关依赖 |
| `tsconfig.json` | TS 配置（可共用或简化） |

### 保留在 FarmStar/
| 文件/目录 | 说明 |
|-----------|------|
| `caretaker-app/` | 养护员 App |
| `.playwright-cli/` | 工具 |
| `CLAUDE.md` | 项目说明 |
| `.claude/` | Skills 配置 |
| `skills-lock.json` | Skills 锁定 |

### 删除
- 根目录 `node_modules/`（在 caretakar-app 内已有）
- 根目录 `package-lock.json`（拆分后各自独立）
- 根目录 `dist/`
- `tailwind.config.js`（已在 caretaker-app 内）
- `TODO.md`（如与 garden 无关则删除）

---

## 实施步骤

1. 在 `garden-web/` 和 `garden-server/` 建立新 git 仓库
2. 用 `git subtree split` 将对应目录的历史分离到新仓库
3. 为两个新仓库编写独立的 package.json
4. 清理根目录：删除已移出的文件和 node_modules
5. 更新根目录 .gitignore
6. 提交所有变更
