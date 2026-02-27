# Landing Page Hoi Trai Tong Quan 2026 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and ship a Vite + Vanilla JS single-page landing website with 4 sections and image overlay, using assets/captions extracted from provided DOCX files.

**Architecture:** The app is a static Vite site that renders content from a structured data module. A Python extraction script reads each DOCX, exports images into `public/images`, and generates image/caption JSON consumed by `src/data/content.js`. UI is rendered in `src/main.js` and styled in `src/style.css` with newspaper-longform visual rhythm.

**Tech Stack:** Vite (Vanilla JS), CSS, Vitest + jsdom, Python 3 (DOCX unzip/XML parsing)

---

### Task 1: Scaffold Project

**Files:**
- Create: `package.json` (via Vite init)
- Create: `index.html` (via Vite init)
- Create: `src/main.js` (via Vite init then replace)
- Create: `src/style.css` (via Vite init then replace)
- Create: `src/data/content.js`
- Create: `scripts/extract_docx_assets.py`

**Step 1: Initialize Vite vanilla project**

Run: `npm create vite@latest . -- --template vanilla`

**Step 2: Install dependencies**

Run: `npm install`

**Step 3: Add test dependencies**

Run: `npm install -D vitest jsdom`

**Step 4: Add test script**

Modify `package.json` scripts to include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

**Step 5: Commit (if git initialized)**

```bash
git add package.json package-lock.json index.html src/main.js src/style.css
git commit -m "chore: scaffold vite vanilla project and test tooling"
```

### Task 2: Write Failing Data/Render Tests

**Files:**
- Create: `tests/content.test.js`
- Create: `tests/lightbox.test.js`
- Modify: `vitest.config.js` (if needed)

**Step 1: Write failing content shape test**

```js
import { describe, it, expect } from 'vitest'
import { siteContent } from '../src/data/content'

describe('site content', () => {
  it('has 4 sections in required order', () => {
    expect(siteContent.sections).toHaveLength(4)
    expect(siteContent.sections.map(s => s.id)).toEqual([
      'quan-chung-phong-khong-khong-quan',
      'cac-hien-vat',
      'khong-gian-van-hoa-ho-chi-minh',
      'cac-hinh-anh-tuyen-quan'
    ])
  })
})
```

**Step 2: Write failing lightbox behavior test**

```js
import { describe, it, expect } from 'vitest'
import { buildLightboxState } from '../src/main'

describe('lightbox state', () => {
  it('cycles next/prev within section image list', () => {
    const state = buildLightboxState(3)
    expect(state.next(2)).toBe(0)
    expect(state.prev(0)).toBe(2)
  })
})
```

**Step 3: Run tests to verify fail**

Run: `npm run test`
Expected: FAIL (modules/functions not yet implemented)

**Step 4: Commit (if git initialized)**

```bash
git add tests/content.test.js tests/lightbox.test.js
git commit -m "test: add failing tests for content structure and lightbox state"
```

### Task 3: Build DOCX Extraction Script

**Files:**
- Create: `scripts/extract_docx_assets.py`
- Create: `generated/content-data.json`

**Step 1: Write failing script smoke test (manual)**

Run: `python scripts/extract_docx_assets.py --help`
Expected: command exists and prints usage

**Step 2: Implement extraction script**

Include logic:
- Unzip DOCX and read `word/document.xml` + rels
- Export media files to `public/images/<section>/`
- Track run sequence (image/text)
- Assign captions by nearest following text in sequence
- Fallback caption if missing
- Normalize duplicated captions (e.g., repeated phrase twice)
- Save combined output to `generated/content-data.json`

**Step 3: Run extraction**

Run: `python scripts/extract_docx_assets.py`
Expected: images exported and JSON generated for 4 sections

**Step 4: Commit (if git initialized)**

```bash
git add scripts/extract_docx_assets.py generated/content-data.json public/images
git commit -m "feat: extract images and captions from docx sources"
```

### Task 4: Implement Content Data Module

**Files:**
- Modify: `src/data/content.js`

**Step 1: Write failing import test**

Add test assertion:

```js
expect(siteContent.hero.title).toMatch('Hội trại tòng quân năm 2026')
```

**Step 2: Implement `siteContent` object**

Include:
- title/subtitle/intro
- 4 sections with ids/titles
- image items from generated JSON
- alt text fallback derived from caption

**Step 3: Run tests**

Run: `npm run test`
Expected: content tests pass

**Step 4: Commit (if git initialized)**

```bash
git add src/data/content.js tests/content.test.js
git commit -m "feat: define structured content data for landing page"
```

### Task 5: Implement Page Rendering

**Files:**
- Modify: `src/main.js`
- Modify: `index.html`

**Step 1: Write failing DOM render test**

```js
import { renderApp } from '../src/main'

document.body.innerHTML = '<div id="app"></div>'
renderApp(document.getElementById('app'))
expect(document.querySelectorAll('section.content-section').length).toBe(4)
```

**Step 2: Implement renderer**

Implement:
- sticky nav with anchor links
- hero block
- map 4 sections to article-like layout
- image cards with captions

**Step 3: Run tests**

Run: `npm run test`
Expected: render tests pass

**Step 4: Commit (if git initialized)**

```bash
git add src/main.js index.html tests
git commit -m "feat: render hero, anchored sections, and galleries"
```

### Task 6: Implement Lightbox Overlay

**Files:**
- Modify: `src/main.js`
- Modify: `tests/lightbox.test.js`

**Step 1: Expand failing tests**

Add tests for:
- open on card click
- close on ESC
- next/prev wrap-around

**Step 2: Implement lightbox controller**

Implement:
- open/close state
- keyboard handlers
- backdrop close
- body scroll lock
- image counter and caption

**Step 3: Run tests**

Run: `npm run test`
Expected: lightbox tests pass

**Step 4: Commit (if git initialized)**

```bash
git add src/main.js tests/lightbox.test.js
git commit -m "feat: add accessible lightbox overlay with keyboard controls"
```

### Task 7: Implement Visual Design and Motion

**Files:**
- Modify: `src/style.css`

**Step 1: Write failing style smoke checklist (manual)**

Checklist target:
- no horizontal scroll on 375px
- visible focus states
- section reveal only if motion allowed

**Step 2: Implement CSS system**

Implement:
- design tokens (paper/red/gold/green)
- typography (Merriweather + Be Vietnam Pro)
- newspaper longform layout
- responsive image grid
- subtle reveal/hover transitions
- `prefers-reduced-motion` handling

**Step 3: Manual verify in dev server**

Run: `npm run dev`
Expected: layout and motion match approved direction

**Step 4: Commit (if git initialized)**

```bash
git add src/style.css
git commit -m "feat: apply newspaper visual system and responsive styling"
```

### Task 8: Verification and Build

**Files:**
- Modify: `README.md` (create if missing)

**Step 1: Run automated verification**

Run:
- `npm run test`
- `npm run build`

Expected:
- tests pass
- vite build succeeds

**Step 2: Manual QA checklist**

Verify:
- 4 sections in right order
- anchors navigate correctly
- overlay open/close/prev/next/esc works
- captions shown and fallback works
- mobile/tablet/desktop responsive

**Step 3: Add run/deploy guide**

Add README instructions for:
- local dev
- rebuilding assets from DOCX
- GitHub -> Vercel deploy

**Step 4: Commit (if git initialized)**

```bash
git add README.md
git commit -m "docs: add local run and vercel deployment instructions"
```

### Task 9: Final Delivery Snapshot

**Files:**
- N/A

**Step 1: Capture final status**

Run:
- `git status --short` (if git initialized)
- `npm run build`

**Step 2: Prepare handoff notes**

Include:
- implemented scope
- test/build evidence
- known limitations

**Step 3: Optional release commit (if git initialized)**

```bash
git add .
git commit -m "feat: deliver 2026 tong quan landing page"
```
