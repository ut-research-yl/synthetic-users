---
description: Deactivate the GitHub Pages public link after usability testing (ut-research-yl/li-ut)
---

Takes the UT link offline by replacing the site content with an offline page.
Does NOT touch the SAP internal repo (github.tools.sap/I587018/Q3-LI-UT).

## Steps

### 1. Replace content with offline page

```bash
cd /tmp && rm -rf li-ut && git clone https://github.com/ut-research-yl/li-ut.git
cd /tmp/li-ut
git config user.email "ut-research-yl@github.com" && git config user.name "ut-research-yl"
git rm -rf . --quiet
```

Create `index.html`:
```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Offline</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;color:#666}p{font-size:1.1rem}</style>
</head><body><p>This page is no longer available.</p></body></html>
```

```bash
git add index.html && git commit -m "chore: deactivate UT site"
git push --force origin main
```

### 2. Confirm

```
✅ Public link deactivated. https://ut-research-yl.github.io/li-ut/ is now offline.
```

Note: all JS/CSS assets are removed so even cached visitors will get a broken app on reload.
