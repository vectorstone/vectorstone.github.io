# Obsidian 到博客发布流程

当前博客仓库作为 Obsidian 仓库的 submodule 放在：

```bash
04 blog/vectorstone.github.io
```

## 发布一篇笔记

1. 在 Obsidian 中整理文章，确认没有私密信息、未完成片段和本地绝对路径。
2. 将文章复制或移动到 `04 blog/vectorstone.github.io/_posts/`。
3. 文件名建议使用 `YYYY-MM-DD-title.md`，例如 `2026-05-24-arch-linux-fcitx5-rime.md`。
4. 在文件顶部添加 front matter：

```yaml
---
title: 文章标题
subtitle: 可选副标题
date: 2026-05-24
author: Gavin
tags:
  - Linux
  - Arch
---
```

5. 在博客子仓库中本地预览：

```bash
cd "04 blog/vectorstone.github.io"
npm install
npm run dev
```

6. 提交子仓库，再回到 Obsidian 父仓库提交 submodule 指针。

```bash
cd "04 blog/vectorstone.github.io"
git add .
git commit -m "publish: add new post"
git push

cd ../../..
git add .gitmodules "04 blog/vectorstone.github.io"
git commit -m "chore: update blog submodule"
git push
```

## Markdown 多平台发布建议

Markdown 可以作为写作源稿，但不同平台对 Markdown 的支持不一致。

- GitHub Pages/Astro：适合直接发布 Markdown，保留代码块、标题、链接和远程图片。
- x.com：不支持完整 Markdown 长文。适合从 Markdown 摘要生成 thread，代码块和图片需要重新整理。
- 微信公众号：编辑器不原生支持完整 Markdown。建议用 mdnice、Doocs Markdown、微信公众号编辑器或自建转换脚本，把 Markdown 转成公众号可粘贴的 HTML/CSS。

为了跨平台复用，文章里尽量使用标准 Markdown：标题、列表、代码块、表格、引用、普通链接和 HTTPS 图片。少用 Obsidian 双链、块引用 ID、Dataview、Canvas、Callout 等私有语法；必须使用时，在发布前转换成普通 Markdown。

当前 Astro 站点会对常见 Obsidian 语法做轻量兼容：

- `[[内部链接]]` 会显示成普通文本。
- `![[图片.png]]` 会转换成普通 Markdown 图片语法。
- `> [!note]` 这类 callout 会转换成普通引用标题。

这只能覆盖基础写法。Dataview 查询、Canvas、块引用 ID、嵌入 PDF、本地附件路径仍建议在发布前手工整理。
