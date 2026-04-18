# Feishu/Lark to Obsidian

把飞书/Lark 文档一键导出为适合 Obsidian 使用的 Markdown。

这个仓库包含两种使用方式：

- 本地批量导出脚本，适合处理很多分享链接
- 浏览器插件，适合打开页面后点一下直接下载

[English README](./README.md)

## 功能

- 打开你有查看权限的飞书/Lark 页面
- 自动尝试展开常见折叠内容
- 自动处理飞书内部滚动容器和动态加载内容
- 导出适合 Obsidian 的 Markdown
- 同时保留一份原始纯文本备份，尽量减少漏字风险

## 为什么要做这个

飞书/Lark 页面通常不是普通静态网页，而是动态渲染、内部滚动、按块加载。通用网页剪藏工具经常只能抓到一部分正文，或者只抓到当前可见区域。这个项目专门针对飞书/Lark 的页面结构做了提取策略优化。

## 仓库结构

- `browser-extension/` Chrome / Edge 插件，点击后自动下载到 `Downloads/Feishu Exports/`
- `src/index.mjs` 基于 Playwright 的本地批量导出脚本
- `links.txt` 批量导出时使用的链接列表
- `package.json` 本地工具配置

## 方式一：浏览器插件

适合快速导出单篇文档。

### 安装

1. 打开 `chrome://extensions` 或 `edge://extensions`
2. 开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择 `browser-extension/`

### 使用

1. 打开一个飞书/Lark 文档或知识库页面
2. 等页面正文基本加载出来
3. 点击一次插件图标
4. 插件会自动下载：
   - `文档标题.md`
   - `文档标题.raw.txt`

文件会保存到 `Downloads/Feishu Exports/`。

## 方式二：本地批量导出

适合一次处理很多分享链接。

### 安装

```bash
npm install
npm run install:browser
```

### 准备链接

在 `links.txt` 中每行放一个飞书/Lark 链接。

```text
https://example.feishu.cn/wiki/xxxx
https://example.larksuite.com/docx/xxxx
```

### 运行

```bash
npm run export
```

也可以直接双击：

- `Check Environment.command`
- `Run Export.command`

### 输出结果

- `output/markdown/*.md`
- `output/raw-text/*.raw.txt`
- `output/meta/*.json`
- `output/manifest.json`

## 注意事项

- 这个项目不能绕过飞书/Lark 权限限制
- 某些复杂卡片、嵌入块、多维表格不一定能完美转成 Markdown
- 为了尽量保全文字内容，会额外输出 `.raw.txt` 纯文本备份

## 验证思路

这个项目先用真实飞书分享页做过本地验证。最初使用通用抓取方法时只能导出一小段正文；改成针对飞书内部滚动容器的累计提取后，导出文本长度已经明显接近整篇文档。
