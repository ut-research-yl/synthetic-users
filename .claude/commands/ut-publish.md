---
description: Build and publish a public GitHub Pages link for usability testing (yaelee-sap.github.io/user-testing-Q3)
---

Publishes the app to **https://yaelee-sap.github.io/user-testing-Q3/** for usability testing.
Pushes ONLY the built `docs/` output — source code stays on github.tools.sap only.

## Steps

### 1. Patch vite.config.ts — set base path

Edit `vite.config.ts`, change base to:
```ts
base: '/user-testing-Q3/',
```

Do NOT commit this change — it will be reverted after building.

### 2. Build

```bash
npx vite build
```

Verify `docs/index.html` references `/user-testing-Q3/assets/...`.

### 3. Revert vite.config.ts

```bash
git checkout -- vite.config.ts
```

### 4. Push docs/ to yaelee-sap/user-testing-Q3

```bash
cd /tmp && rm -rf user-testing-Q3 && git clone https://github.com/yaelee-sap/user-testing-Q3.git
git config user.email "yaelee@github.com" && git config user.name "yaelee-sap"
```

Sync the build:
```bash
rsync -a /Users/I587018/Q3-LI-UT/docs/ /tmp/user-testing-Q3/
cd /tmp/user-testing-Q3 && git add -A && git commit -m "chore: deploy UT build"
```

Then ask the user to run:
```bash
cd /tmp/user-testing-Q3 && git push --force origin main
```

### 5. Enable GitHub Pages (first time only)

```bash
gh api --method POST /repos/yaelee-sap/user-testing-Q3/pages \
  -f "source[branch]=main" -f "source[path]=/" 2>&1
```

If `{"message":"Conflict",...}` — Pages already enabled, skip.

### 6. Confirm

```
✅ Public link: https://yaelee-sap.github.io/user-testing-Q3/
```

May take ~1–2 minutes to go live.
