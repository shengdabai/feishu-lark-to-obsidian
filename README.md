# feishu-lark-to-obsidian

One-click + batch export of Feishu/Lark docs to clean, Obsidian-ready Markdown (browser extension + Playwright CLI).

## Business Context

- **Category:** browser productivity tool
- **Audience:** knowledge workers and learners who spend most of their workflow in the browser.
- **Repository status:** Public repository. Keep examples, docs, and issues free of credentials, private data, and machine-specific paths.
- **Topics:** browser-extension, export, feishu, lark, markdown, markdown-export, obsidian, playwright

## What This Project Is For

- One-click + batch export of Feishu/Lark docs to clean, Obsidian-ready Markdown (browser extension + Playwright CLI).
- Compress repetitive browser work into a focused user interaction.
- Keep installation, permissions, and data boundaries visible.

## Where It Fits

This repository reduces browser friction while keeping installation, permissions, and data boundaries visible.

## Technical Overview

- **Primary language:** JavaScript
- **Detected stack:** JavaScript, Node.js
- **Default branch:** `main`
- **Visibility:** `PUBLIC`
- **License:** MIT License

## Repository Map

- `src`
- `Check Environment.command`
- `LICENSE`
- `README.md`
- `Run Export.command`
- `SECURITY.md`
- `browser-extension`
- `links.example.txt`
- `package-lock.json`
- `package.json`

## Quick Start

Use the commands that match the current project state:

```bash
npm install
npm start
```

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies. |
| `npm start` | node src/index.mjs |

## Operating Notes

- Keep real credentials out of the repository. Use local environment files, GitHub repository secrets, or the deployment platform secret manager.
- If a `.env.example` file exists, treat it as documentation only; never commit filled-in `.env` files.
- Before publishing screenshots, demos, or client examples, remove private names, internal paths, account IDs, and API endpoints.
- The `Repository Hygiene` workflow is a lightweight guardrail, not a replacement for product-specific tests.

## Delivery Checklist

- [ ] README describes the user, business outcome, and operating boundary.
- [ ] Setup or preview commands are current and do not rely on private machine state.
- [ ] No real secrets, private user data, or machine-local state are tracked.
- [ ] Screenshots, demos, or sample outputs are safe to share publicly when the repository is public.
- [ ] Product-specific tests or smoke checks are documented before production use.

## Roadmap

- Tighten the fastest path from clone to useful demo.
- Add project-specific screenshots, sample outputs, or a short walkthrough where useful.
- Promote repeated manual steps into scripts, tests, or documented workflows.
- Keep security, privacy, and licensing boundaries explicit as the project evolves.

## Maintainer Notes

Maintained by [Tony Sheng](https://github.com/shengdabai). This README is written as a business-facing handoff: it should help a future collaborator, client, or reviewer understand why the repository exists, how to inspect it, and what must be true before it is reused or shipped.

```text
output/
├─ markdown/*.md        # Obsidian-ready Markdown (numbered by run order)
├─ raw-text/*.raw.txt   # visible-text backup for cross-checking
├─ meta/*.json          # per-document metadata (title, source, lengths)
└─ manifest.json        # full run report: success + failure per link
```

Each Markdown file carries a small front section (source URL, export time, extraction note) followed by the body. When structured extraction falls short, the exporter automatically falls back to the cumulative scroll text so you still get the full content.

## 🗺️ Status

Early but working (`v0.1.0`). Validated against real shared Feishu wiki pages: a generic clip first returned only a partial section; after switching to container-aware scrolling and cumulative collection, the exported length came much closer to the full document.

Known limits:

- Does **not** bypass Feishu/Lark permissions — you must be able to view the page.
- Complex cards, embeds, and multi-dimensional (Bitable) tables may not convert perfectly to Markdown — the `.raw.txt` backup is there precisely for these cases.

## 🤝 Connect & about

Built in public by **Tony (Sheng)** — a Chinese-language teacher with 6,000+ students, building AI + Chinese-teaching tools so creators and learners spend less time fighting their tools.

If this saves you a migration headache, **⭐ Star the repo and [follow @shengdabai](https://github.com/shengdabai)** — it genuinely helps and tells me what to build next.

More tools in the same spirit:

- 🧩 [browser-extensions](https://github.com/shengdabai/browser-extensions) — small, focused browser tools
- 📚 [dev-guides-collection](https://github.com/shengdabai/dev-guides-collection) — practical build-in-public guides
- 🤖 [everything-claude-code](https://github.com/shengdabai/everything-claude-code) — Claude Code workflows, skills & setups

## License

Released under the [MIT License](./LICENSE). You're free to use, modify, and distribute this project — attribution appreciated but not required.

---

<a id="中文"></a>

# 📑 飞书 / Lark → Obsidian

> 把飞书/Lark 文档导出成干净、可直接放进 Obsidian 的 Markdown —— 浏览器里点一下，或在终端批量处理上百个链接。

**[English](#-feishu--lark--obsidian) | 中文**

[![最近提交](https://img.shields.io/github/last-commit/shengdabai/feishu-lark-to-obsidian)](https://github.com/shengdabai/feishu-lark-to-obsidian/commits)
[![Stars](https://img.shields.io/github/stars/shengdabai/feishu-lark-to-obsidian?style=social)](https://github.com/shengdabai/feishu-lark-to-obsidian/stargazers)
[![关注 @shengdabai](https://img.shields.io/github/followers/shengdabai?style=social)](https://github.com/shengdabai)

---

## 为什么要做这个

飞书/Lark 页面不是普通静态网页：它动态渲染、按块懒加载，而且正文常常藏在**内部滚动容器**里。通用网页剪藏工具一般只能抓到当前可见的一小段，剩下的悄无声息地丢掉。如果你剪藏过一篇飞书知识库、结果三十页的文档只导出了三段,这种痛你懂。

本项目针对飞书/Lark 做了**专门的提取策略** —— 容器感知滚动 + 文本累计采集 —— 让导出的 Markdown 尽量贴近整篇文档,同时附带一份原始纯文本兜底,接住格式化漏掉的内容。

## 这是什么

一个仓库,两种互补用法:

- **浏览器插件** —— 打开页面,点一下,`.md` + `.raw.txt` 直接进下载目录。适合临时单篇导出。
- **本地批量导出** —— 把链接列表放进文件,跑一条命令,然后去喝杯咖啡。适合一次迁移很多文档。

两者输出格式一致,也都尊重飞书权限 —— 只导出你本来就能看到的内容。

## ✨ 功能

- **两种用法,同一目标** —— 一键导出插件 + Playwright 批量脚本。
- **容器感知滚动** —— 处理飞书内部滚动容器和按块懒加载,而不只是当前视口。
- **自动展开** —— 采集前自动点掉常见的"展开 / 查看更多 / Show more"折叠。
- **为 Obsidian 而生的 Markdown** —— 通过 Turndown + GFM 转换标题、列表、GFM 表格和分隔线。
- **原始文本兜底** —— 每次导出都额外写一份 `.raw.txt` 可见纯文本,格式不完美时也不会丢字。
- **批量带清单** —— CLI 为每篇文档写 `meta/*.json`,并在顶层生成 `manifest.json` 记录每条链接的成功/失败。
- **持久浏览器配置** —— 登录一次,批量脚本跨多次运行复用你的会话。
- **尊重权限** —— 不绕过、不乱抓,只导出你账号能看到的内容。

## 🧱 技术栈

| 层 | 用了什么 |
|----|---------|
| 运行时 | Node.js (ESM) |
| 批量自动化 | [Playwright](https://playwright.dev/)(Chromium,持久化上下文) |
| HTML → Markdown | [Turndown](https://github.com/mixmark-io/turndown) + `turndown-plugin-gfm` |
| 插件 | Chrome / Edge Manifest V3(`activeTab`、`scripting`、`downloads`) |

## 🚀 快速开始

### 方式一 —— 浏览器插件(最快)

1. 打开 `chrome://extensions` 或 `edge://extensions`。
2. 开启**开发者模式**。
3. 点击**加载已解压的扩展程序**,选择 `browser-extension/` 目录。
4. 打开一个你有查看权限的飞书/Lark 文档或知识库页面,等正文加载出来,点一次插件图标。

两个文件会进入 `Downloads/Feishu Exports/`:`标题.md` 和 `标题.raw.txt`。图标角标显示 `OK` 表示成功,显示 `ERR` 表示页面不支持或没提取到正文(把鼠标悬停到图标上可看具体说明)。

### 方式二 —— 本地批量导出

```bash
npm install
npm run install:browser   # 安装 Playwright 的 Chromium
```

复制 `links.example.txt` 为 `links.txt`,每行一个链接:

```text
https://example.feishu.cn/wiki/xxxx
https://example.larksuite.com/docx/xxxx
```

然后运行:

```bash
npm run export
```

会弹出一个真实 Chromium 窗口;如未登录就先登录飞书,回到终端按回车开始。想先空跑检查?`node src/index.mjs --check` 会校验环境并解析 `links.txt`,不启动浏览器。

> `.command` 启动器(`Check Environment.command`、`Run Export.command`)是 macOS 双击快捷方式 —— 使用前请先修改文件里写死的路径,指向你本地的仓库位置。

## 📖 用法与输出

批量导出写入 `output/` 目录:

```text
output/
├─ markdown/*.md        # 可直接放进 Obsidian 的 Markdown(按运行顺序编号)
├─ raw-text/*.raw.txt   # 可见纯文本备份,便于核对
├─ meta/*.json          # 每篇文档的元数据(标题、来源、长度)
└─ manifest.json        # 完整运行报告:每条链接成功/失败
```

每个 Markdown 文件开头有一小段信息(来源 URL、导出时间、提取说明),后面是正文。当结构化提取效果不佳时,导出器会自动回退到滚动累计文本,保证你拿到完整内容。

## 🗺️ 状态

早期但可用(`v0.1.0`)。已用真实飞书分享页验证过:通用方法最初只导出一小段;换成容器感知滚动 + 累计采集后,导出长度明显接近整篇文档。

已知限制:

- **不能**绕过飞书/Lark 权限 —— 你必须能看到该页面。
- 复杂卡片、嵌入块、多维表格可能无法完美转成 Markdown —— `.raw.txt` 备份正是为这些情况准备的。

## 🤝 关于与联系

由 **Tony(盛)** 在公开开发(build in public)中打造 —— 一名拥有 6000+ 学员的中文老师,做 AI + 中文教学工具,让创作者和学习者少跟工具较劲、多做正事。

如果它帮你省了一次迁移的头疼,欢迎 **⭐ Star 本仓库并 [关注 @shengdabai](https://github.com/shengdabai)** —— 这真的很有帮助,也告诉我接下来该做什么。

同系列的更多工具:

- 🧩 [browser-extensions](https://github.com/shengdabai/browser-extensions) —— 小而专注的浏览器工具
- 📚 [dev-guides-collection](https://github.com/shengdabai/dev-guides-collection) —— 实用的公开开发指南
- 🤖 [everything-claude-code](https://github.com/shengdabai/everything-claude-code) —— Claude Code 工作流、skills 与配置

## 许可

Released under the [MIT License](./LICENSE). You're free to use, modify, and distribute this project — attribution appreciated but not required.
