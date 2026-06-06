# 📑 Feishu / Lark → Obsidian

> Pull Feishu/Lark docs into clean, Obsidian-ready Markdown — one click in the browser, or batch hundreds of links from the terminal.

**English | [中文](#中文)**

[![Last commit](https://img.shields.io/github/last-commit/shengdabai/feishu-lark-to-obsidian)](https://github.com/shengdabai/feishu-lark-to-obsidian/commits)
[![Stars](https://img.shields.io/github/stars/shengdabai/feishu-lark-to-obsidian?style=social)](https://github.com/shengdabai/feishu-lark-to-obsidian/stargazers)
[![Follow @shengdabai](https://img.shields.io/github/followers/shengdabai?style=social)](https://github.com/shengdabai)

---

## Why this exists

Feishu/Lark pages aren't normal static web pages. They render dynamically, lazy-load by block, and live inside *internal scroll containers*. Generic web clippers usually grab only the visible slice and silently drop the rest. If you've ever clipped a Feishu wiki and gotten three paragraphs out of a thirty-page doc, you know the pain.

This project uses a **Feishu/Lark-specific extraction strategy** — container-aware scrolling plus cumulative text collection — so the exported Markdown stays close to the full document, and a raw-text backup catches anything the formatter misses.

## What it is

Two complementary workflows, one repo:

- **Browser extension** — open a page, click once, get `.md` + `.raw.txt` in your Downloads. Best for quick one-offs.
- **Local batch exporter** — drop a list of links in a file, run one command, walk away. Best for migrating many docs at once.

Both produce the same shape of output and both honor your Feishu permissions — they only export what you can already see.

## ✨ Features

- **Two flows, one purpose** — click-to-export extension *and* a Playwright batch runner.
- **Container-aware scrolling** — handles Feishu's internal scroll containers and block-based lazy loading, not just the visible viewport.
- **Auto-expand** — clicks through common "展开 / 查看更多 / Show more" toggles before capturing.
- **Markdown built for Obsidian** — headings, lists, GFM tables, and dividers via Turndown + GFM.
- **Raw-text safety net** — every export also writes a `.raw.txt` of the visible text, so nothing is silently lost when formatting is imperfect.
- **Batch with a manifest** — the CLI writes per-doc `meta/*.json` plus a top-level `manifest.json` recording every success and failure.
- **Persistent browser profile** — log in once; the batch runner reuses your session across runs.
- **Permission-respecting** — no bypass, no scraping you shouldn't; it exports what your account can view.

## 🧱 Tech stack

| Layer | What |
|-------|------|
| Runtime | Node.js (ESM) |
| Batch automation | [Playwright](https://playwright.dev/) (Chromium, persistent context) |
| HTML → Markdown | [Turndown](https://github.com/mixmark-io/turndown) + `turndown-plugin-gfm` |
| Extension | Chrome / Edge Manifest V3 (`activeTab`, `scripting`, `downloads`) |

## 🚀 Quick start

### Option 1 — Browser extension (fastest)

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the `browser-extension/` folder.
4. Open a Feishu/Lark doc or wiki page you can view, wait for the body to render, then click the extension icon once.

Two files land in `Downloads/Feishu Exports/`: `Title.md` and `Title.raw.txt`. The toolbar badge shows `OK` on success or `ERR` if the page isn't supported or no body was found (hover the icon for details).

### Option 2 — Local batch exporter

```bash
npm install
npm run install:browser   # installs Playwright's Chromium
```

Create `links.txt` (copy `links.example.txt`) with one link per line:

```text
https://example.feishu.cn/wiki/xxxx
https://example.larksuite.com/docx/xxxx
```

Then run:

```bash
npm run export
```

A real Chromium window opens; log into Feishu if needed, return to the terminal, and press Enter to start. Want a dry run first? `node src/index.mjs --check` validates your setup and parses `links.txt` without launching the browser.

> The `.command` launchers (`Check Environment.command`, `Run Export.command`) are macOS double-click shortcuts — edit the hardcoded path inside each to point at your local checkout before using them.

## 📖 Usage & output

The batch exporter writes into `output/`:

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

No license file is currently included, so all rights are reserved by default. If you'd like to reuse this in your own project, please [open an issue](https://github.com/shengdabai/feishu-lark-to-obsidian/issues) — I'm happy to add a permissive license on request.

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

目前仓库未包含 license 文件,因此默认保留所有权利。如果你想在自己的项目中复用,请[提一个 issue](https://github.com/shengdabai/feishu-lark-to-obsidian/issues) —— 我很乐意按需添加宽松许可证。
