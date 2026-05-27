import type { Ref } from 'vue'

type Ctx = CanvasRenderingContext2D

/** hex + alpha → rgba string */
function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`
}

const COLORS: Record<string, string> = {
  happy:    '#C8A882',   // 奶油燕麥黃
  sad:      '#7A8FA0',   // 迷霧灰藍
  excited:  '#B05A4A',   // 煙燻磚紅
  relaxed:  '#7A9E8A',   // 鼠尾草綠
  romantic: '#B87A8A',   // 乾燥玫瑰粉
  scared:   '#4A4070',   // 沉夜靛紫
  inspired: '#6A8E8A',   // 尤加利青
  nostalgic:'#8B6A3A',   // 煙草焦糖
}

// ── 紋理繪製函式 ──────────────────────────────────────────

/** 開心：從中心向外輻射的細線束（參考圖「joy」） */
function drawHappy(ctx: Ctx, w: number, h: number, c: string) {
  const cx = w * 0.5, cy = h * 0.52
  const n = 160
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.12
    const len = 120 + Math.random() * Math.max(w, h) * 0.7
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10)
    ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len)
    ctx.strokeStyle = rgba(c, 0.035 + Math.random() * 0.055)
    ctx.lineWidth = 0.4 + Math.random() * 0.9
    ctx.stroke()
  }
}

/** 悲傷：密集細點顆粒感（參考圖「apathy」重磅紋理） */
function drawSad(ctx: Ctx, w: number, h: number, c: string) {
  for (const [alpha, count, maxR] of [
    [0.022, 2800, 1.1],
    [0.038, 1000, 1.4],
    [0.055, 400,  0.7],
  ] as [number, number, number][]) {
    ctx.fillStyle = rgba(c, alpha)
    for (let i = 0; i < count; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * w, Math.random() * h, 0.3 + Math.random() * maxR, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/** 興奮：多中心爆炸線條（參考圖「hate/joy」） */
function drawExcited(ctx: Ctx, w: number, h: number, c: string) {
  const centers: [number, number][] = [
    [w * 0.5,  h * 0.48],
    [w * 0.24, h * 0.32],
    [w * 0.76, h * 0.65],
  ]
  for (const [cx, cy] of centers) {
    for (let i = 0; i < 55; i++) {
      const a = Math.random() * Math.PI * 2
      const len = 60 + Math.random() * Math.max(w, h) * 0.65
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len)
      ctx.strokeStyle = rgba(c, 0.04 + Math.random() * 0.07)
      ctx.lineWidth = 0.5 + Math.random() * 2.8
      ctx.stroke()
    }
  }
}

/** 放鬆：同心有機橢圓輪廓（參考圖「love/tenderness」年輪感） */
function drawRelaxed(ctx: Ctx, w: number, h: number, c: string) {
  const cx = w * 0.5, cy = h * 0.5
  ctx.lineWidth = 0.65
  for (let r = 0; r < 32; r++) {
    const base = 40 + r * 28
    const wob = 2.5 + r * 1.3
    const steps = 260
    ctx.strokeStyle = rgba(c, 0.052 + (r % 3) * 0.01)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2
      const wobble = Math.sin(a * (4 + r % 3) + r * 0.6) * wob
      const x = cx + Math.cos(a) * (base * 1.38 + wobble)
      const y = cy + Math.sin(a) * (base + wobble * 0.65)
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }
}

/** 浪漫：多層柔和螺旋（參考圖「love」旋轉感） */
function drawRomantic(ctx: Ctx, w: number, h: number, c: string) {
  const cx = w * 0.5, cy = h * 0.5
  for (let s = 0; s < 5; s++) {
    const loops = 5 + s * 2
    const maxR = Math.min(w, h) * (0.25 + s * 0.06)
    const offA = s * (Math.PI / 3.5)
    const steps = 900
    ctx.strokeStyle = rgba(c, 0.055 + s * 0.008)
    ctx.lineWidth = 0.75
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const a = t * loops * Math.PI * 2 + offA
      const r = t * maxR
      const wob = Math.sin(a * 2.5 + s) * 3.5
      const x = cx + Math.cos(a) * (r + wob)
      const y = cy + Math.sin(a) * (r + wob)
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

/** 刺激/恐懼：密集不規則短斜線群（參考圖「irritation」） */
function drawScared(ctx: Ctx, w: number, h: number, c: string) {
  for (let i = 0; i < 320; i++) {
    const bx = Math.random() * w
    const by = Math.random() * h
    const cluster = 1 + Math.floor(Math.random() * 5)
    for (let j = 0; j < cluster; j++) {
      const x = bx + (Math.random() - 0.5) * 55
      const y = by + (Math.random() - 0.5) * 55
      const a = Math.random() * Math.PI
      const len = 4 + Math.random() * 22
      ctx.beginPath()
      ctx.moveTo(x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2)
      ctx.lineTo(x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2)
      ctx.strokeStyle = rgba(c, 0.045 + Math.random() * 0.08)
      ctx.lineWidth = 0.7 + Math.random() * 2.2
      ctx.stroke()
    }
  }
}

/** 勵志：從畫面底部向上放射的光束（參考圖「joy」向上強版） */
function drawInspired(ctx: Ctx, w: number, h: number, c: string) {
  const cx = w * 0.5, cy = h * 1.1
  for (let i = 0; i < 120; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9
    const len = 180 + Math.random() * h * 1.4
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len)
    ctx.strokeStyle = rgba(c, 0.022 + Math.random() * 0.042)
    ctx.lineWidth = 0.4 + Math.random() * 1.4
    ctx.stroke()
  }
}

/** 懷舊：稀疏飄落的點與短線（參考圖「calm」靜謐感） */
function drawNostalgic(ctx: Ctx, w: number, h: number, c: string) {
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    if (Math.random() < 0.55) {
      ctx.beginPath()
      ctx.arc(x, y, 0.6 + Math.random() * 2.8, 0, Math.PI * 2)
      ctx.fillStyle = rgba(c, 0.07 + Math.random() * 0.09)
      ctx.fill()
    }
    else {
      const a = Math.random() * Math.PI
      const len = 2 + Math.random() * 11
      ctx.beginPath()
      ctx.moveTo(x - Math.cos(a) * len, y - Math.sin(a) * len)
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
      ctx.strokeStyle = rgba(c, 0.055 + Math.random() * 0.075)
      ctx.lineWidth = 0.5 + Math.random() * 1.3
      ctx.stroke()
    }
  }
}

const DRAW_FNS: Record<string, (ctx: Ctx, w: number, h: number, c: string) => void> = {
  happy:    drawHappy,
  sad:      drawSad,
  excited:  drawExcited,
  relaxed:  drawRelaxed,
  romantic: drawRomantic,
  scared:   drawScared,
  inspired: drawInspired,
  nostalgic:drawNostalgic,
}

// ── Composable ────────────────────────────────────────────

export function useTextureCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  mood: Ref<string | null>,
) {
  let W = 0
  let H = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    // 0.68x 解析度：降低繪製工作量，同時帶來輕微的模糊柔化感
    W = Math.floor(window.innerWidth * 0.68)
    H = Math.floor(window.innerHeight * 0.68)
    canvas.width  = W
    canvas.height = H
  }

  function draw(key: string) {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)
    DRAW_FNS[key]?.(ctx, W, H, COLORS[key] ?? '#8B6A4B')
  }

  const onResize = () => {
    resize()
    if (mood.value) draw(mood.value)
  }

  watch(mood, (newMood) => {
    if (timer) clearTimeout(timer)
    const canvas = canvasRef.value
    if (!canvas) return

    if (!newMood) {
      canvas.style.opacity = '0'
      return
    }

    const currentOpacity = parseFloat(canvas.style.opacity || '0')
    if (currentOpacity > 0.1) {
      // 已有紋理：先淡出 → 換色 → 淡入
      canvas.style.opacity = '0'
      timer = setTimeout(() => {
        draw(newMood)
        canvas.style.opacity = '1'
      }, 300)
    }
    else {
      draw(newMood)
      canvas.style.opacity = '1'
    }
  })

  onMounted(() => {
    resize()
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
    window.removeEventListener('resize', onResize)
  })
}
