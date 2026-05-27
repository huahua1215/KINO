# CLAUDE.md — KINO 專案規範與教訓筆記

> 每次啟動時請先完整閱讀此檔案，再開始任何動作。
> 這是本專案的「記憶核心」，記錄所有規範、偏好與過去犯過的錯誤。

---

## 一、專案概覽

**專案名稱**：KINO｜電影情緒探索網站
**技術棧**：Nuxt 3 + TailwindCSS + GSAP + Pinia + TMDB API
**開發工具**：Google Antigravity（Agent-first IDE）
**目標**：以「情緒」作為入口，讓使用者依照當下心情瀏覽電影推薦，並可收藏電影至本地。

### 核心功能清單
- [ ] 情緒選擇入口頁（首頁）
- [ ] 依情緒篩選的電影列表頁
- [ ] 電影詳情彈窗（Modal）
- [ ] 收藏功能（Pinia + LocalStorage）
- [ ] 收藏清單頁
- [ ] GSAP 卡片進場動畫
- [ ] 情緒切換轉場效果

---

## 二、目錄結構規範

當前工作目錄即為專案根目錄，所有檔案直接建立於此，不需再建子資料夾包覆。

```
（當前目錄）/
├── CLAUDE.md                  ← 本檔案，永遠在根目錄
├── PROMPT.txt                 ← 啟動提詞（僅參考用）
├── .env                       ← TMDB API 金鑰（不得 commit）
├── .env.example               ← 範本，需 commit
├── nuxt.config.ts
├── tailwind.config.ts
├── app.vue
├── pages/
│   ├── index.vue              ← 情緒選擇首頁
│   ├── movies/
│   │   └── [mood].vue         ← 依情緒的電影列表
│   └── favorites.vue          ← 收藏清單
├── components/
│   ├── MoodSelector.vue
│   ├── MovieCard.vue
│   ├── MovieModal.vue
│   └── NavBar.vue
├── composables/
│   ├── useTMDB.ts             ← TMDB API 封裝
│   └── useAnimations.ts       ← GSAP 動畫邏輯
├── stores/
│   └── favorites.ts           ← Pinia 收藏 store
├── types/
│   └── movie.ts               ← TypeScript 型別定義
└── public/
    └── moods/                 ← 情緒對應圖示或背景圖
```

---

## 三、程式碼規範

### 語言與框架
- 全專案使用 **TypeScript**，禁止使用 `any`，型別定義於 `types/` 目錄
- 使用 **Composition API + `<script setup>`**，不使用 Options API
- 使用 **`useAsyncData` 或 `useFetch`** 處理 SSR 資料抓取，不在 `onMounted` 裡直接呼叫 API

### 命名規範
- 元件檔：`PascalCase.vue`（例：`MovieCard.vue`）
- composable：`use` 開頭 camelCase（例：`useTMDB.ts`）
- store：功能名稱 camelCase（例：`favorites.ts`）
- CSS class：全部使用 TailwindCSS utility，不自訂 class 名稱（除非 GSAP target 需要）

### API 規範
- TMDB API 金鑰透過 `.env` 的 `TMDB_API_KEY` 傳入，使用 `useRuntimeConfig()` 讀取
- 所有 TMDB 請求封裝於 `composables/useTMDB.ts`，不在 page/component 直接呼叫 fetch
- 圖片路徑固定前綴：`https://image.tmdb.org/t/p/w500`

### 情緒對應表（Mood Map）
```typescript
export const MOOD_MAP = {
  happy:     { label: '開心', genres: [35, 10402],  color: '#FFD700' },
  sad:       { label: '悲傷', genres: [18, 10749],  color: '#6B9BD2' },
  excited:   { label: '興奮', genres: [28, 12],     color: '#FF4500' },
  relaxed:   { label: '放鬆', genres: [99, 36],     color: '#90EE90' },
  romantic:  { label: '浪漫', genres: [10749, 35],  color: '#FFB6C1' },
  scared:    { label: '刺激', genres: [27, 53],     color: '#800080' },
  inspired:  { label: '勵志', genres: [18, 36],     color: '#FFA500' },
  nostalgic: { label: '懷舊', genres: [10751, 16],  color: '#D2691E' },
}
```

---

## 四、狀態管理規範（Pinia）

```typescript
// stores/favorites.ts 結構
{
  state: {
    items: Movie[]
  },
  actions: {
    addFavorite(movie: Movie): void
    removeFavorite(movieId: number): void
    toggleFavorite(movie: Movie): void
    isFavorited(movieId: number): boolean
    loadFromStorage(): void   // app 啟動時呼叫
    saveToStorage(): void     // 每次異動後呼叫
  }
}
```

- LocalStorage key：`kino-favorites`
- 資料格式：JSON 序列化的 `Movie[]`
- `loadFromStorage()` 須在 `app.vue` 的 `onMounted` 呼叫，確保 hydration 後才讀取

---

## 五、動畫規範（GSAP）

- GSAP 動畫邏輯封裝於 `composables/useAnimations.ts`
- 動畫 target 使用 `ref` 或特定 class（class 名稱需在 TailwindCSS safelist 加入）
- 必須在 `onMounted` 內初始化，確保 DOM 已存在
- 卡片進場：stagger 效果，delay 0.1s per card
- 情緒切換：fade + scale 轉場，duration 0.4s
- Modal 開關：slide-up + fade，duration 0.3s
- 禁止在 SSR 環境使用 GSAP（用 `onMounted` 保護）

---

## 六、環境設定

```bash
# .env.example（需 commit）
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

```typescript
// nuxt.config.ts 中需加入
runtimeConfig: {
  tmdbApiKey: process.env.TMDB_API_KEY,  // 僅 server 端可存取
  public: {
    tmdbBaseUrl: process.env.TMDB_BASE_URL,
  }
}
```

---

## 七、測試規範

### 開發環境測試流程
```bash
npm run dev
# 確認以下頁面正常渲染：
# http://localhost:3000              → 情緒選擇首頁
# http://localhost:3000/movies/happy → 電影列表
# http://localhost:3000/favorites    → 收藏清單頁
```

### 功能驗收 Checklist
- [ ] 首頁情緒按鈕可點擊並跳轉至正確路由
- [ ] 電影列表頁成功從 TMDB 抓取資料並顯示卡片
- [ ] 點擊電影卡片開啟 Modal，顯示正確電影資訊
- [ ] 點擊愛心按鈕可收藏/取消收藏，狀態即時更新
- [ ] 重新整理頁面後收藏資料仍保留（LocalStorage 驗證）
- [ ] 切換不同情緒，電影列表正確更新
- [ ] GSAP 動畫正常執行，無 console 錯誤
- [ ] TypeScript 編譯無錯誤：`npm run typecheck`
- [ ] 無 ESLint 錯誤：`npm run lint`

### Antigravity 瀏覽器 Agent 測試
每完成一個功能模組，使用 Antigravity 內建瀏覽器 agent 自動驗證：
- 開啟 http://localhost:3000，截圖確認首頁渲染正常
- 點擊任一情緒按鈕，確認跳轉與電影卡片出現
- 點擊電影卡片，確認 Modal 正常開啟與內容正確
- 點擊愛心，確認收藏狀態即時變化
- 前往收藏頁，確認已收藏電影正確顯示
- 重新整理頁面，確認收藏資料保留

---

## 八、過去犯過的錯誤（教訓筆記）

> 每次發現新錯誤，修復後立即補充在此區塊。

### ❌ 錯誤 #001：在 SSR 直接使用 localStorage
**問題**：在 composable 頂層直接呼叫 `localStorage.getItem()`，導致 SSR 報錯 `localStorage is not defined`
**正確做法**：所有 localStorage 存取必須放在 `onMounted` 或加上 `if (process.client)` 保護

### ❌ 錯誤 #002：TMDB API Key 暴露於前端
**問題**：將 API Key 放在 `runtimeConfig.public` 導致前端可見
**正確做法**：API Key 放在 `runtimeConfig`（非 public），透過 server route 代理請求

### ❌ 錯誤 #003：GSAP 在 setup() 中直接呼叫
**問題**：在 `<script setup>` 頂層初始化 GSAP，DOM 尚未掛載
**正確做法**：所有 GSAP 初始化必須放在 `onMounted` 內

### ❌ 錯誤 #004：未處理 API 請求失敗狀態
**問題**：API 失敗時 UI 空白，無任何錯誤提示
**正確做法**：使用 `useAsyncData` 的 `error` 回傳值，顯示錯誤訊息與重試按鈕

### ❌ 錯誤 #005：電影圖片路徑錯誤
**問題**：直接使用 TMDB 回傳的 `poster_path`（相對路徑），導致圖片無法顯示
**正確做法**：必須加上前綴 `https://image.tmdb.org/t/p/w500` + `poster_path`

### ❌ 錯誤 #006：Nuxt 4 的 Server API 目錄位置
**問題**：在 Nuxt 4 結構中將 API 路由放在 `app/server/api/`，導致 Vue Router 報錯 404 (No match found for location with path "/api/...")
**正確做法**：Server 相關目錄（包含 `server/api`、`server/routes`）必須放在專案根目錄下，不能放在 `app/` 資料夾內。

### ❌ 錯誤 #007：Nuxt 4 中的 process.client 棄用
**問題**：在 stores 或 composables 中使用 `process.client` 判斷客戶端環境時，ESLint 會報錯 `Replace process.client with import.meta.client`。
**正確做法**：在 Nuxt 4 (或較新版本) 中，應使用標準的 `import.meta.client` 和 `import.meta.server` 來替代 `process.client` 和 `process.server`。

### ❌ 錯誤 #008：在大型模糊元素上使用 `transition-colors` 導致 hover 卡頓
**問題**：對帶有大量 `blur`（如 `blur-[130px]`）的背景光暈 div 套用 `transition-colors duration-1000`，導致每次 hover 觸發 6 個大元素連續 repaint 長達 1000ms，畫面明顯卡頓。
**正確做法**：`background-color` 過渡無法被 GPU 合成，必須避免對大型模糊元素做顏色漸變。改用 `opacity` 過渡（GPU 合成，不觸發 repaint），或讓顏色即時切換（blur 本身的視覺模糊性讓瞬間切換不明顯）。

### ❌ 錯誤 #009：GSAP 動畫 `boxShadow` 屬性導致逐 frame repaint
**問題**：在 `addMoodButtonHover` 中用 GSAP 動畫化 `boxShadow`，每個動畫 frame 都觸發 paint，消耗大量 CPU。
**正確做法**：只動 `transform`（`scale`、`translate`、`rotate`）與 `opacity`，這兩者可被 GPU 合成不觸發 repaint。若需發光效果，改用 CSS `filter: drop-shadow()` 或在 template 中用 opacity 過渡的覆蓋層實現。

### ❌ 錯誤 #010：`mix-blend-mode` 破壞 GPU 獨立 layer 優化
**問題**：對動畫粒子容器設定 `mix-blend-mode: screen`，使瀏覽器無法對底層所有元素建立獨立 GPU 合成層，導致整個頁面失去 layer 優化。
**正確做法**：避免在含有動畫子元素的容器上使用 blend mode。若必須使用，改用低 opacity 搭配無 blend mode 的方式模擬效果。

### ❌ 錯誤 #011：SVG `feTurbulence` 高 `numOctaves` 搭配 hover scale 造成效能瓶頸
**問題**：MoodIcon 的手繪濾鏡使用 `numOctaves="3"`，8 個圖示同時在畫面上，hover 時 `scale` 動畫觸發濾鏡重新計算，每個 octave 讓計算量翻倍。
**正確做法**：`numOctaves` 降到 2，`scale` 位移量從 3.5 降到 2。手繪感視覺差異極小，但 GPU 計算量減半。`filter` 的邊界範圍（`x/y/width/height`）也應盡量縮小，避免過大的渲染緩衝區。

---

## 九、Git 規範

```
feat: 新增功能
fix: 修復 bug
style: 樣式調整
refactor: 重構
docs: 文件更新
chore: 設定、依賴調整
```

- 禁止 commit `.env`（已加入 .gitignore）
- 每個功能開一個 branch，完成後 merge 回 main

---

## 十、工作流程

**每次啟動必須執行：**

1. 閱讀本檔案（CLAUDE.md）
2. 進入 **Plan Mode**：列出本次任務，與使用者確認
3. 使用者確認後，切換執行模式開始動手
4. 每完成一個模組，執行對應 checklist 與瀏覽器測試
5. 遇到錯誤修復後，立即補寫至「教訓筆記」區塊
6. 所有任務完成後，執行完整 checklist 最終驗收

**Plan Mode 輸出格式：**
```
## 本次計畫

### 目標
[描述本次要完成的功能]

### 執行步驟
1. [步驟一]
2. [步驟二]

### 預期產出
- [產出一]

### 測試方式
- [如何驗證功能正常]

請確認以上計畫，確認後我將開始執行。
```
