import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const CURRENT_FILE = fileURLToPath(import.meta.url);
const PROJECT_DIR = path.resolve(path.dirname(CURRENT_FILE), "..");
const LINKS_FILE = path.join(PROJECT_DIR, "links.txt");
const OUTPUT_DIR = path.join(PROJECT_DIR, "output");
const MARKDOWN_DIR = path.join(OUTPUT_DIR, "markdown");
const RAW_DIR = path.join(OUTPUT_DIR, "raw-text");
const META_DIR = path.join(OUTPUT_DIR, "meta");
const PROFILE_DIR = path.join(PROJECT_DIR, "browser-profile");
const LOG_DIR = path.join(PROJECT_DIR, "logs");

const WAIT_AFTER_SCROLL_MS = 1200;
const MAX_SCROLL_ROUNDS = 18;
const MAX_COLLECTION_ROUNDS = 40;

const EXPAND_LABELS = [
  "展开",
  "展开更多",
  "查看更多",
  "显示全部",
  "继续阅读",
  "更多",
  "全文",
  "阅读更多",
  "Expand",
  "Show more",
  "See more",
  "More"
];

const FEISHU_IGNORED_LINE_PATTERNS = [
  /^飞书云文档$/,
  /^登录\/注册$/,
  /^帮助中心$/,
  /^效率指南$/,
  /^加载中\.\.\.$/,
  /^与我分享$/,
  /^评论（\d+）$/,
  /^header-v2$/,
  /^纳豆的云文档$/,
  /^纳$/
];

function log(message) {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

async function ensureDirectories() {
  await Promise.all([
    fs.mkdir(OUTPUT_DIR, { recursive: true }),
    fs.mkdir(MARKDOWN_DIR, { recursive: true }),
    fs.mkdir(RAW_DIR, { recursive: true }),
    fs.mkdir(META_DIR, { recursive: true }),
    fs.mkdir(PROFILE_DIR, { recursive: true }),
    fs.mkdir(LOG_DIR, { recursive: true })
  ]);
}

async function readLinks() {
  let raw;
  try {
    raw = await fs.readFile(LINKS_FILE, "utf8");
  } catch {
    throw new Error(
      `未找到 ${LINKS_FILE}。请先复制 links.example.txt 为 links.txt，并填入飞书链接。`
    );
  }

  const links = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (links.length === 0) {
    throw new Error(`links.txt 里还没有有效链接。`);
  }

  return [...new Set(links)];
}

function isCheckMode() {
  return process.argv.includes("--check");
}

function slugify(inputText) {
  return inputText
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "untitled";
}

function createTurndownService() {
  const service = new TurndownService({
    codeBlockStyle: "fenced",
    headingStyle: "atx",
    bulletListMarker: "-",
    emDelimiter: "_"
  });

  service.use(gfm);

  service.remove(["script", "style", "noscript", "svg"]);

  service.addRule("feishuDivider", {
    filter(node) {
      return node.nodeName === "HR";
    },
    replacement() {
      return "\n\n---\n\n";
    }
  });

  return service;
}

function cleanLine(text) {
  return text
    .replace(/[\u200b-\u200f\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldIgnoreLine(line) {
  return FEISHU_IGNORED_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function uniqueOrderedLines(lines) {
  const seen = new Set();
  const result = [];

  for (const originalLine of lines) {
    const line = cleanLine(originalLine);
    if (!line || shouldIgnoreLine(line)) {
      continue;
    }

    const key = line;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(line);
  }

  return result;
}

function looksLikeHeading(line) {
  return [
    /^第[一二三四五六七八九十0-9]+章/,
    /^[一二三四五六七八九十]+[、.：:]/,
    /^技巧\d+/,
    /^法则[一二三四五六七八九十]/,
    /^本章小结$/,
    /^\d+[、.]/,
    /^[（(][一二三四五六七八九十0-9]+[）)]/
  ].some((pattern) => pattern.test(line));
}

function renderTextLinesAsMarkdown(lines) {
  const output = [];

  for (const line of lines) {
    if (looksLikeHeading(line)) {
      if (output.length > 0 && output.at(-1) !== "") {
        output.push("");
      }
      output.push(`## ${line}`);
      output.push("");
    } else {
      output.push(line);
    }
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function waitForUserToLogin() {
  const rl = readline.createInterface({ input, output });
  try {
    await rl.question(
      "\n如果浏览器里还没登录飞书，请现在登录。完成后回到终端按回车继续..."
    );
  } finally {
    rl.close();
  }
}

async function clickExpandableElements(page) {
  await page.evaluate((labels) => {
    const textMatches = new Set(labels);
    const selectors = [
      "button",
      "[role='button']",
      "span",
      "a",
      "div"
    ];

    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    for (let round = 0; round < 5; round += 1) {
      let clickedAny = false;
      for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        for (const element of elements) {
          const text = (element.textContent || "").trim();
          if (!text || !isVisible(element)) {
            continue;
          }
          if ([...textMatches].some((label) => text === label || text.includes(label))) {
            element.click();
            clickedAny = true;
          }
        }
      }
      if (!clickedAny) {
        break;
      }
    }
  }, EXPAND_LABELS);
}

async function autoScroll(page) {
  let previousHeight = 0;
  for (let i = 0; i < MAX_SCROLL_ROUNDS; i += 1) {
    const currentHeight = await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
    });

    await page.waitForTimeout(WAIT_AFTER_SCROLL_MS);
    await clickExpandableElements(page);

    if (currentHeight === previousHeight) {
      break;
    }
    previousHeight = currentHeight;
  }

  await page.evaluate(() => window.scrollTo(0, 0));
}

async function collectFeishuScrollText(page) {
  const chunks = [];
  let previousSignature = "";

  for (let round = 0; round < MAX_COLLECTION_ROUNDS; round += 1) {
    const snapshot = await page.evaluate(() => {
      const rootCandidates = [
        ".page-main",
        ".page-main-item.editor",
        ".editor-container",
        ".page-block.root-block",
        "#docx .page-main",
        "#docx"
      ];

      const getVisibleText = (element) => {
        if (!element) {
          return "";
        }
        return (element.innerText || "").replace(/\n{3,}/g, "\n\n").trim();
      };

      const root =
        rootCandidates
          .map((selector) => document.querySelector(selector))
          .find((element) => element && getVisibleText(element)) ||
        document.body;

      const scrollCandidates = Array.from(document.querySelectorAll("div, main, section"))
        .filter((element) => element.scrollHeight > element.clientHeight + 200)
        .sort((left, right) => {
          const leftScore = left.scrollHeight - left.clientHeight;
          const rightScore = right.scrollHeight - right.clientHeight;
          return rightScore - leftScore;
        });

      const rootText = getVisibleText(root);

      const scroller =
        scrollCandidates.find((element) => element.contains(root) || root.contains(element)) ||
        scrollCandidates.find((element) => {
          const className = typeof element.className === "string" ? element.className : "";
          return className.includes("bear-web") || className.includes("scrollbar");
        }) ||
        document.scrollingElement ||
        document.documentElement;

      const titleFromDoc =
        document.querySelectorAll("h1")[1]?.textContent?.trim() ||
        document.title.replace(/\s*-\s*飞书云文档\s*$/, "").trim() ||
        document.title.trim();

      return {
        title: titleFromDoc,
        rootText,
        html: root.innerHTML,
        scrollerTop: scroller.scrollTop,
        scrollerHeight: scroller.scrollHeight,
        scrollerClientHeight: scroller.clientHeight
      };
    });

    chunks.push(snapshot.rootText);

    const signature = snapshot.rootText.slice(0, 500);
    const scrollerAtBottom =
      snapshot.scrollerTop + snapshot.scrollerClientHeight >= snapshot.scrollerHeight - 10;

    if (scrollerAtBottom && signature === previousSignature) {
      return snapshot.title
        ? { title: snapshot.title, chunks, html: snapshot.html }
        : { chunks, html: snapshot.html };
    }

    previousSignature = signature;

    const scrolled = await page.evaluate(() => {
      const scrollCandidates = Array.from(document.querySelectorAll("div, main, section"))
        .filter((element) => element.scrollHeight > element.clientHeight + 200)
        .sort((left, right) => {
          const leftScore = left.scrollHeight - left.clientHeight;
          const rightScore = right.scrollHeight - right.clientHeight;
          return rightScore - leftScore;
        });

      const root =
        document.querySelector(".page-main") ||
        document.querySelector(".page-main-item.editor") ||
        document.querySelector(".editor-container") ||
        document.querySelector("#docx") ||
        document.body;

      const scroller =
        scrollCandidates.find((element) => element.contains(root) || root.contains(element)) ||
        scrollCandidates.find((element) => {
          const className = typeof element.className === "string" ? element.className : "";
          return className.includes("bear-web") || className.includes("scrollbar");
        }) ||
        document.scrollingElement ||
        document.documentElement;

      const nextTop = Math.min(
        scroller.scrollTop + Math.max(scroller.clientHeight * 0.8, 600),
        scroller.scrollHeight
      );

      scroller.scrollTop = nextTop;

      return {
        top: scroller.scrollTop,
        height: scroller.scrollHeight,
        clientHeight: scroller.clientHeight
      };
    });

    await page.waitForTimeout(900);
    await clickExpandableElements(page);

    if (scrolled.top + scrolled.clientHeight >= scrolled.height - 10) {
      await page.waitForTimeout(900);
    }
  }

  return { chunks, html: "" };
}

async function extractPageContent(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(2500);
  await clickExpandableElements(page);
  await autoScroll(page);
  const scrollCollected = await collectFeishuScrollText(page);

  const extracted = await page.evaluate(() => {
    const isVisible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    const selectorCandidates = [
      "[data-page-id]",
      "[class*='docx']",
      "[class*='wiki']",
      "main",
      "article",
      "body"
    ];

    let bestElement = document.body;
    let bestLength = 0;

    for (const selector of selectorCandidates) {
      const elements = Array.from(document.querySelectorAll(selector));
      for (const element of elements) {
        if (!element || !isVisible(element)) {
          continue;
        }
        const text = (element.innerText || "").trim();
        if (text.length > bestLength) {
          bestLength = text.length;
          bestElement = element;
        }
      }
    }

    const cloned = bestElement.cloneNode(true);
    cloned.querySelectorAll("script,style,noscript,svg").forEach((node) => node.remove());

    const visibleText = (document.body.innerText || "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const title =
      document.querySelectorAll("h1")[1]?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() ||
      document.title?.trim() ||
      "Untitled Feishu Document";

    return {
      title,
      bestSelectorHint: bestElement.tagName,
      html: cloned.innerHTML,
      rawText: visibleText,
      locationHref: location.href
    };
  });

  return {
    ...extracted,
    collectedChunks: scrollCollected.chunks || [],
    collectedTitle: scrollCollected.title || "",
    collectedHtml: scrollCollected.html || ""
  };
}

function buildMarkdown({ title, sourceUrl, markdownBody, rawText, extractionNote }) {
  const safeBody = markdownBody.trim();
  return [
    `# ${title}`,
    "",
    `- 来源: ${sourceUrl}`,
    `- 导出时间: ${new Date().toISOString()}`,
    `- 提取说明: ${extractionNote}`,
    "",
    "## 正文",
    "",
    safeBody || "_未能提取到结构化正文，请查看原始纯文本备份。_",
    "",
    "## 文字保全说明",
    "",
    "已额外生成同名 `.raw.txt` 文件，保存页面可见纯文本，便于对照检查是否有遗漏。"
  ].join("\n");
}

async function exportOne(page, url, index, total) {
  log(`开始处理 ${index}/${total}: ${url}`);
  const turndown = createTurndownService();
  const data = await extractPageContent(page, url);
  const htmlMarkdownBody = turndown.turndown(data.collectedHtml || data.html || "");
  const scrollTextLines = uniqueOrderedLines(
    (data.collectedChunks || []).flatMap((chunk) => chunk.split(/\r?\n/))
  );
  const scrollTextBody = renderTextLinesAsMarkdown(scrollTextLines);
  const markdownBody =
    scrollTextBody.replace(/\s/g, "").length > htmlMarkdownBody.replace(/\s/g, "").length
      ? scrollTextBody
      : htmlMarkdownBody;
  const preservedRawText = uniqueOrderedLines([
    ...(data.rawText || "").split(/\r?\n/),
    ...scrollTextLines
  ]).join("\n");

  const documentTitle = cleanLine(data.collectedTitle || data.title || "Untitled Feishu Document");
  const normalizedTitle = slugify(documentTitle);
  const fileBase = `${String(index).padStart(3, "0")} - ${normalizedTitle}`;
  const markdownPath = path.join(MARKDOWN_DIR, `${fileBase}.md`);
  const rawTextPath = path.join(RAW_DIR, `${fileBase}.raw.txt`);
  const metaPath = path.join(META_DIR, `${fileBase}.json`);

  const extractionNote =
    markdownBody.replace(/\s/g, "").length < preservedRawText.replace(/\s/g, "").length * 0.45
      ? "已采用滚动累计文本兜底，结构化 Markdown 之外还保留了全文纯文本备份。"
      : "已完成结构化 Markdown 提取，并保留全文纯文本备份。";

  const markdownDocument = buildMarkdown({
    title: documentTitle,
    sourceUrl: data.locationHref || url,
    markdownBody,
    rawText: preservedRawText,
    extractionNote
  });

  const metadata = {
    title: documentTitle,
    sourceUrl: data.locationHref || url,
    exportedAt: new Date().toISOString(),
    bestSelectorHint: data.bestSelectorHint,
    markdownLength: markdownBody.length,
    rawTextLength: preservedRawText.length,
    collectedChunkCount: data.collectedChunks.length,
    extractionNote
  };

  await Promise.all([
    fs.writeFile(markdownPath, markdownDocument, "utf8"),
    fs.writeFile(rawTextPath, preservedRawText, "utf8"),
    fs.writeFile(metaPath, JSON.stringify(metadata, null, 2), "utf8")
  ]);

  log(`已输出: ${path.basename(markdownPath)}`);

  return {
    title: documentTitle,
    sourceUrl: data.locationHref || url,
    markdownPath,
    rawTextPath,
    metaPath
  };
}

async function main() {
  await ensureDirectories();
  const links = await readLinks();

  log(`读取到 ${links.length} 个链接。`);

  if (isCheckMode()) {
    log("检查模式通过：目录、依赖、links.txt 解析均正常。");
    return;
  }

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1440, height: 960 }
  });

  const page = context.pages()[0] || (await context.newPage());

  try {
    log("浏览器已启动。");
    await waitForUserToLogin();

    const manifest = [];

    for (let i = 0; i < links.length; i += 1) {
      try {
        const result = await exportOne(page, links[i], i + 1, links.length);
        manifest.push({ status: "success", ...result });
      } catch (error) {
        const failure = {
          status: "failed",
          sourceUrl: links[i],
          error: error instanceof Error ? error.message : String(error),
          failedAt: new Date().toISOString()
        };
        manifest.push(failure);
        log(`处理失败: ${links[i]}`);
        log(`失败原因: ${failure.error}`);
      }
    }

    const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    log(`全部完成，结果清单已写入 ${manifestPath}`);
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error("\n导出任务失败：");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
