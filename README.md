# Feishu/Lark to Obsidian

One-click tools for exporting Feishu/Lark documents into Markdown files that work well in Obsidian.

This repository includes two workflows:

- A local batch exporter for processing many shared Feishu/Lark links
- A browser extension for one-click download of the current Feishu/Lark page

[中文说明](./README.zh-CN.md)

## What it does

- Opens Feishu/Lark pages you can view
- Expands common collapsed sections and waits for dynamic content
- Scrolls through internal document containers to capture more complete text
- Exports Markdown for Obsidian
- Also saves a raw text backup to reduce the risk of missing content

## Why this exists

Feishu/Lark pages are dynamic and often use internal scroll containers, lazy loading, and block-based rendering. Generic web clippers frequently miss content or only capture the visible section. This project uses a Feishu/Lark-specific extraction strategy that performed much better in local testing.

## Repository structure

- `browser-extension/` Chrome/Edge extension for one-click download to `Downloads/Feishu Exports/`
- `src/index.mjs` local batch exporter using Playwright
- `links.txt` input list for batch export
- `package.json` local tooling setup

## Option 1: Browser extension

Best for quick one-off exports.

### Install

1. Open `chrome://extensions` or `edge://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select `browser-extension/`

### Use

1. Open a Feishu/Lark document or wiki page
2. Wait until the page content is visible
3. Click the extension icon once
4. The extension downloads:
   - `Document Title.md`
   - `Document Title.raw.txt`

Files are saved to `Downloads/Feishu Exports/`.

## Option 2: Local batch exporter

Best for processing many shared links.

### Install

```bash
npm install
npm run install:browser
```

### Prepare links

Put one Feishu/Lark link per line in `links.txt`.

```text
https://example.feishu.cn/wiki/xxxx
https://example.larksuite.com/docx/xxxx
```

### Run

```bash
npm run export
```

You can also double-click:

- `Check Environment.command`
- `Run Export.command`

### Output

- `output/markdown/*.md`
- `output/raw-text/*.raw.txt`
- `output/meta/*.json`
- `output/manifest.json`

## Notes and limitations

- This does not bypass Feishu/Lark permissions
- Complex embeds, multi-dimensional tables, and some cards may not convert perfectly to Markdown
- The raw text backup is included specifically to preserve visible text when formatting is imperfect

## Tested idea

The extraction logic was validated against a shared Feishu wiki page that initially exported only a partial section with a generic approach. After switching to container-aware scrolling and cumulative text collection, the exported text length became much closer to the full document.
