# KINO｜依情境探索電影

以「情境」作為入口的沉浸式電影探索網站。選一個此刻的場景，找到今晚最適合你的電影。

🔗 **Demo**：[kino-trmp.vercel.app](https://kino-trmp.vercel.app)

---

## Tech Stack

| 分類 | 技術 |
|------|------|
| 框架 | Nuxt 4 + TypeScript |
| 樣式 | TailwindCSS |
| 動畫 | GSAP 3 |
| 狀態管理 | Pinia |
| 資料來源 | TMDB API |
| 部署 | Vercel |

---

## Features

- **情境選擇首頁**：6 種情境入口，hover / touch 觸發 blob 色彩動畫與背景光暈變化
- **電影列表頁**：依情境對應類型向 TMDB 抓取電影，無限捲動瀏覽
- **電影詳情 Modal**：點擊卡片展開詳情，顯示評分、片長、劇情簡介與類型標籤
- **收藏功能**：Pinia + LocalStorage 狀態管理，重整頁面後資料保留
- **沉浸式視覺效果**：WebGL 手繪紋理層、漂移光暈系統、電影院光束動畫
- **手機版兩段式觸控**：首次點擊預覽情境效果，再次點擊進入列表

---

## 專案結構

```
KINO/
├── server/
│   └── api/
│       └── tmdb.ts           # TMDB API 代理（保護 API Key）
├── app/
│   ├── pages/
│   │   ├── index.vue         # 情境選擇首頁
│   │   ├── movies/[mood].vue # 電影列表頁
│   │   └── favorites.vue     # 收藏清單
│   ├── components/
│   │   ├── MoodSelector.vue  # 情境選擇格線
│   │   ├── MovieCard.vue     # 電影卡片
│   │   ├── MovieModal.vue    # 電影詳情彈窗
│   │   └── NavBar.vue        # 導覽列
│   ├── composables/
│   │   ├── useTMDB.ts        # TMDB API 封裝
│   │   ├── useAnimations.ts  # GSAP 動畫邏輯
│   │   └── useTextureWebGL.ts # WebGL 紋理層
│   ├── stores/
│   │   └── favorites.ts      # 收藏 Pinia Store
│   └── utils/
│       └── moodMap.ts        # 情境對應設定表
```

---

## 本地開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 並填入你的 TMDB API Key：

```bash
cp .env.example .env
```

```env
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

> TMDB API Key 可至 [themoviedb.org](https://www.themoviedb.org/settings/api) 免費申請。

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

---

## 部署（Vercel）

1. 將專案推至 GitHub
2. 在 Vercel 匯入該 Repository
3. 至 **Settings → Environment Variables** 新增：
   - `TMDB_API_KEY`
   - `TMDB_BASE_URL`
4. 重新部署即可

---

## 情境對應表

| 情境 | 說明 | 對應類型 |
|------|------|----------|
| 週五夜，一個人 | 關燈，不要睡 | 恐怖、驚悚、懸疑 |
| 約會夜 | 讓對方記住這個夜晚 | 愛情、喜劇 |
| 跟家人一起看 | 老少咸宜，笑聲滿屋 | 家庭、動畫、喜劇 |
| 想大哭一場 | 讓眼淚好好流出來 | 劇情 |
| 我要開心 | 看完整個人都亮了 | 喜劇、音樂、動畫 |
| 史詩冒險 | 震撼的大銀幕體驗 | 動作、冒險、科幻 |
