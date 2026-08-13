---
description: Deactivate the GitHub Pages public link after usability testing (yaelee-sap/user-testing-Q3)
---

Takes the UT link offline by replacing the site content with an offline page.
Does NOT touch the SAP internal repo (github.tools.sap/I587018/Q3-LI-UT).

## Steps

### 1. Replace content with offline page

```bash
cd /tmp && rm -rf user-testing-Q3 && git clone https://github.com/yaelee-sap/user-testing-Q3.git
cd /tmp/user-testing-Q3
git config user.email "yaelee@github.com" && git config user.name "yaelee-sap"
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
```

Then ask the user to run:
```bash
cd /tmp/user-testing-Q3 && git push --force origin main
```

### 2. Confirm

```
✅ Public link deactivated. https://yaelee-sap.github.io/user-testing-Q3/ is now offline.
```

Note: all JS/CSS assets are removed so even cached visitors will get a broken app on reload.
