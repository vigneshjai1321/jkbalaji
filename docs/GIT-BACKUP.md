# Git backup only (not production deploy)

Git and GitHub are for **private source backup**, checkpoints, and restore. Production deploy is unchanged: `deployment/deploy.ps1` to the VPS when you approve it manually.

- Remote (HTTPS): `https://github.com/vigneshjai1321/jkbalaji.git`
- Branch: `main`
- Local identity: `Vignesh GJ` / `vigneshjai1321@gmail.com` (repo-local config)

## Point `origin` at HTTPS (recommended)

```powershell
cd E:\JKbalaji
git remote set-url origin https://github.com/vigneshjai1321/jkbalaji.git
git remote -v
```

SSH is **not** required for backup. Do not put personal access tokens in the remote URL.

## Save a checkpoint (local)

```powershell
cd E:\JKbalaji
git status
git add -u
git add .cursor docs deployment package.json .gitignore   # add new files you intend to backup; review `git status` first
git commit -m "checkpoint: short description of what you changed"
```

Review `git status` before `git add`. Never stage `PROJECT_CREDENTIALS.txt` or real `.env` / `.env.local` files (they are gitignored).

## Push backup to GitHub (only when you ask)

```powershell
cd E:\JKbalaji
git push -u origin main
```

Verify the remote received your commit:

```powershell
git ls-remote origin refs/heads/main
git rev-parse HEAD
```

First push: remote should be empty (no force-push). If GitHub already has commits, stop and reconcile histories manually—do not `git push --force`.

## Restore an earlier version safely

**See old code without losing current work:**

```powershell
cd E:\JKbalaji
git log --oneline -15
git show <commit-hash>:path/to/file.tsx
```

**Restore one file from a checkpoint:**

```powershell
git restore --source=<commit-hash> -- path/to/file.tsx
```

**Return entire tree to a checkpoint (destructive to uncommitted work—stash or commit first):**

```powershell
git stash push -m "before restore"
git checkout <commit-hash> -- .
```

Prefer `git checkout <commit> -- .` or new branch from old commit for experiments: `git switch -c try-old <commit-hash>`.

## GitHub authentication

- **HTTPS (default):** Sign in via **GitHub Desktop** (File → Add local repository → `E:\JKbalaji` → Push) or Git Credential Manager when `git push` prompts in the browser. No tokens in chat or committed files.
- **SSH:** Optional for your own machine only; **not required** for this project’s backup workflow.

Do not use GitHub Actions to deploy this app.
