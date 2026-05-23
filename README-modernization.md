# Gavin Blog Modernization

这个仓库已经从旧 Jekyll/Bootstrap 主题迁移到 Astro 静态站点构建方式。历史 `_posts` Markdown 继续作为文章源，GitHub Actions 会构建 `dist/` 并发布到 GitHub Pages。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 内容来源

- 已发布文章：`_posts/*.md`
- Obsidian 发布流程：`docs/obsidian-publishing.md`
- 复制笔记辅助脚本：`node scripts/copy-note-to-post.mjs "../03Linux/example.md"`

## GitHub Pages 设置

仓库 Settings -> Pages 的 Source 需要选择 GitHub Actions。推送到 `master` 或 `main` 后，`.github/workflows/deploy.yml` 会自动发布。

## 推荐提交顺序

先提交并推送博客子仓库：

```bash
cd "04 blog/vectorstone.github.io"
git add .
git commit -m "feat: migrate blog to astro"
git push origin master
```

再回到 Obsidian 父仓库提交 submodule 配置和指针：

```bash
cd ../../..
git add .gitmodules "04 blog/vectorstone.github.io" .claude/worktrees/gifted-elion-5dad26
git commit -m "chore: embed blog as submodule"
git push origin master
```

其中 `.claude/worktrees/gifted-elion-5dad26` 是误跟踪的 gitlink，提交时会从父仓库索引移除，避免 `git submodule status` 报错。
