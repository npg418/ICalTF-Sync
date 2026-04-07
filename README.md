# I(Cal)TF-Sync

自動更新される大学授業用のカレンダーを作ろう

## 使うツールとか

- Bun
- TypeScript
- Cloudflare Workers
- Biome

## Commit Message Rules

このリポジトリは Conventional Commits を採用しています。
`git commit` 時に commitlint が自動でメッセージを検証し、形式が不正な場合はコミットが拒否されます。

形式:

```text
<type>: <summary>
```

例:

```text
feat: add timetable fetcher
fix: handle missing lecture title
docs: update setup steps
```

利用可能な主な type:

- feat
- fix
- docs
- style
- refactor
- perf
- test
- chore
- ci
- revert
