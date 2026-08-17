---
description: Build and publish a public GitHub Pages link for usability testing (ut-research-yl.github.io/li-ut)
---

Publishes the app to **https://ut-research-yl.github.io/li-ut/** for usability testing.
Pushes ONLY the built `docs/` output — source code stays on github.tools.sap only.

## Steps

### 1. Patch vite.config.ts — set base path

Edit `vite.config.ts`, change base to:
```ts
base: '/li-ut/',
```

Do NOT commit this change — it will be reverted after building.

### 2. Build

```bash
npx vite build
```

Verify `docs/index.html` references `/li-ut/assets/...`.

### 3. Revert vite.config.ts

```bash
git checkout -- vite.config.ts
```

### 4. Push docs/ to ut-research-yl/li-ut

```bash
cd /tmp && rm -rf li-ut && git clone https://github.com/ut-research-yl/li-ut.git
cd /tmp/li-ut
git config user.email "ut-research-yl@github.com" && git config user.name "ut-research-yl"
```

Sync the build:
```bash
rsync -a /Users/I587018/Q3-LI-UT/docs/ /tmp/li-ut/
cd /tmp/li-ut && git add -A && git commit -m "chore: deploy UT build"
git push --force origin main
```

### 5. Enable GitHub Pages (first time only)

```bash
gh api --method POST /repos/ut-research-yl/li-ut/pages \
  -f "source[branch]=main" -f "source[path]=/" 2>&1
```

If `{"message":"Conflict",...}` — Pages already enabled, skip.

### 6. Confirm

```
✅ Public link: https://ut-research-yl.github.io/li-ut/
```

May take ~1–2 minutes to go live.
