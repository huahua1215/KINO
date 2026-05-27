import type { Ref } from 'vue'

interface SubBlob {
  ox: number; oy: number   // 相對於粒子中心的偏移
  sr: number               // 半徑比例 (0.4~1.0)
}

interface Particle {
  x: number; y: number
  size: number
  vx: number; vy: number
  opacity: number; maxOpacity: number
  life: number; maxLife: number
  r: number; g: number; b: number
  blobs: SubBlob[]
}

// ── 色票：預設 + 8 種情緒 ──
type RGB = [number, number, number]

const DEFAULT_PALETTE: RGB[] = [
  [255, 255, 255],
  [244, 227, 197],
  [220, 162, 109],
  [99, 124, 142],
  [200, 185, 165],
]

const MOOD_PALETTES: Record<string, RGB[]> = {
  happy:     [[238, 196,  52], [238, 112,  88], [208,  82, 138], [112, 172, 224], [ 88, 198, 162]],
  sad:       [[122, 143, 160], [100, 124, 140], [140, 162, 180], [85, 108, 130],  [155, 175, 190]],
  excited:   [[176,  90,  74], [191, 122,  58], [160,  70,  52], [200, 136,  85], [168,  95,  65]],
  relaxed:   [[122, 158, 138], [109, 143, 122], [143, 175, 155], [100, 135, 115], [155, 185, 165]],
  romantic:  [[184, 122, 138], [158, 106, 122], [196, 138, 152], [170, 115, 130], [200, 150, 162]],
  scared:    [[ 74,  64, 112], [ 62,  53,  96], [ 88,  78, 128], [ 50,  45,  90], [100,  90, 142]],
  inspired:  [[106, 142, 138], [ 92, 122, 117], [122, 160, 156], [ 82, 108, 104], [138, 172, 168]],
  nostalgic: [[139, 106,  58], [107,  79,  53], [158, 122,  74], [125,  95,  48], [168, 135,  88]],
}

// ── 行為：每種情緒有完全不同的粒子形態 ──
interface MoodBehavior {
  speed: number
  direction: -1 | 1   // -1 向上, 1 向下
  drift: number
  sizeMin: number      // 粒子尺寸範圍 (px)
  sizeMax: number
  opacityBase: number  // maxOpacity = base + rand()*range
  opacityRange: number
  blobMin: number      // 每個粒子的子圓數量
  blobMax: number
  spread: number       // 子圓 ox/oy 偏移倍率
  jitter: number       // 每 frame 隨機衝量的觸發機率 (0 = 無)
  count: number        // 此情緒的粒子總數
}

const DEFAULT_BEHAVIOR: MoodBehavior = {
  speed: 1, direction: -1, drift: 1,
  sizeMin: 6, sizeMax: 20,
  opacityBase: 0.12, opacityRange: 0.22,
  blobMin: 3, blobMax: 5,
  spread: 1.2,
  jitter: 0,
  count: 55,
}

const MOOD_BEHAVIORS: Record<string, MoodBehavior> = {
  // 開心：大量小型明亮閃點，緊湊成束，輕快上浮
  happy: {
    speed: 1.3, direction: -1, drift: 1.2,
    sizeMin: 4, sizeMax: 11,
    opacityBase: 0.18, opacityRange: 0.22,
    blobMin: 2, blobMax: 3,
    spread: 0.65,
    jitter: 0,
    count: 72,
  },
  // 悲傷：少量超大霧狀氣團，幾乎透明，緩慢向下沉落
  sad: {
    speed: 0.4, direction: 1, drift: 0.3,
    sizeMin: 18, sizeMax: 36,
    opacityBase: 0.04, opacityRange: 0.07,
    blobMin: 5, blobMax: 7,
    spread: 1.7,
    jitter: 0,
    count: 26,
  },
  // 興奮：大量中型粒子，廣域飛散，帶隨機衝量顯得騷動
  excited: {
    speed: 1.8, direction: -1, drift: 1.8,
    sizeMin: 5, sizeMax: 13,
    opacityBase: 0.18, opacityRange: 0.20,
    blobMin: 2, blobMax: 4,
    spread: 1.4,
    jitter: 0.004,
    count: 72,
  },
  // 放鬆：極少量超大軟雲，極低透明度，幾乎靜止
  relaxed: {
    speed: 0.35, direction: -1, drift: 0.25,
    sizeMin: 20, sizeMax: 40,
    opacityBase: 0.05, opacityRange: 0.09,
    blobMin: 5, blobMax: 7,
    spread: 1.6,
    jitter: 0,
    count: 20,
  },
  // 浪漫：中等數量，中型柔和，緩緩上飄
  romantic: {
    speed: 0.6, direction: -1, drift: 0.5,
    sizeMin: 8, sizeMax: 20,
    opacityBase: 0.10, opacityRange: 0.14,
    blobMin: 3, blobMax: 5,
    spread: 1.0,
    jitter: 0,
    count: 44,
  },
  // 刺激：中量，尺寸落差大，緊湊不規則，帶抖動
  scared: {
    speed: 1.6, direction: -1, drift: 1.5,
    sizeMin: 3, sizeMax: 15,
    opacityBase: 0.20, opacityRange: 0.18,
    blobMin: 2, blobMax: 4,
    spread: 0.75,
    jitter: 0.005,
    count: 65,
  },
  // 勵志：中多量，中型聚焦形狀，快速向上衝
  inspired: {
    speed: 1.4, direction: -1, drift: 1.2,
    sizeMin: 6, sizeMax: 15,
    opacityBase: 0.13, opacityRange: 0.17,
    blobMin: 3, blobMax: 5,
    spread: 0.8,
    jitter: 0,
    count: 60,
  },
  // 懷舊：少量，中型塵埃顆粒感，極慢飄動
  nostalgic: {
    speed: 0.45, direction: -1, drift: 0.35,
    sizeMin: 8, sizeMax: 22,
    opacityBase: 0.06, opacityRange: 0.12,
    blobMin: 3, blobMax: 5,
    spread: 1.2,
    jitter: 0,
    count: 30,
  },
}

export function useParticles(
  canvasRef: Ref<HTMLCanvasElement | null>,
  mood: Ref<string | null>,
  defaultCount = 55,
) {
  let rafId = 0
  const particles: Particle[] = []
  let dpr = 1
  let W = 0
  let H = 0

  let palette: RGB[] = DEFAULT_PALETTE
  let behavior: MoodBehavior = DEFAULT_BEHAVIOR
  let targetCount = defaultCount

  watch(mood, (m) => {
    palette  = (m && MOOD_PALETTES[m])  || DEFAULT_PALETTE
    behavior = (m && MOOD_BEHAVIORS[m]) || DEFAULT_BEHAVIOR
    // mood=null → 全部清空；有 mood → 使用該情緒的粒子數
    targetCount = m ? (MOOD_BEHAVIORS[m]?.count ?? defaultCount) : 0

    // 超量（含 mood=null 全殺）：令其立即壽終，由 tick 移除
    for (let i = targetCount; i < particles.length; i++) {
      const ep = particles[i]
      if (ep) ep.life = ep.maxLife
    }
    // 不足時立即補充
    while (particles.length < targetCount) {
      particles.push(make())
    }
  })

  function make(initial = false): Particle {
    const bh = behavior
    const maxLife = 450 + Math.random() * 550
    const rgb: RGB = palette[Math.floor(Math.random() * palette.length)] ?? [220, 200, 180]
    const [r, g, b] = rgb
    const dir = bh.direction
    const blobCount = bh.blobMin + Math.floor(Math.random() * (bh.blobMax - bh.blobMin + 1))
    return {
      x: Math.random() * W,
      y: initial
        ? Math.random() * H
        : (dir === -1 ? H + Math.random() * 60 : -Math.random() * 60),
      size: bh.sizeMin + Math.random() * (bh.sizeMax - bh.sizeMin),
      vx: (Math.random() - 0.5) * 0.4 * bh.drift,
      vy: dir * (0.2 + Math.random() * 0.65) * bh.speed,
      opacity: 0,
      maxOpacity: bh.opacityBase + Math.random() * bh.opacityRange,
      life: initial ? Math.floor(Math.random() * maxLife) : 0,
      maxLife,
      r, g, b,
      blobs: Array.from({ length: blobCount }, () => ({
        ox: (Math.random() - 0.5) * bh.spread,
        oy: (Math.random() - 0.5) * bh.spread,
        sr: 0.4 + Math.random() * 0.6,
      })),
    }
  }

  function tick() {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !ctx) {
      rafId = requestAnimationFrame(tick)
      return
    }

    ctx.clearRect(0, 0, W * dpr, H * dpr)

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      if (!p) continue
      p.life++
      p.x += p.vx
      p.y += p.vy

      // 隨機衝量（scared / excited 才有）
      if (behavior.jitter > 0 && Math.random() < behavior.jitter) {
        p.vx = Math.max(-2.2, Math.min(2.2, p.vx + (Math.random() - 0.5) * 0.7))
        p.vy = Math.max(-2.2, Math.min(2.2, p.vy + (Math.random() - 0.5) * 0.4))
      }

      // Fade in / sustain / fade out
      const t = p.life / p.maxLife
      if (t < 0.15)      p.opacity = (t / 0.15) * p.maxOpacity
      else if (t > 0.78) p.opacity = ((1 - t) / 0.22) * p.maxOpacity
      else               p.opacity = p.maxOpacity

      // 死亡或出界 → 移除（超量）或替換（正常）
      if (p.life >= p.maxLife || p.y < -20 || p.y > H + 20) {
        if (particles.length > targetCount) {
          particles.splice(i, 1)
          i--
        }
        else {
          particles[i] = make()
        }
        continue
      }

      // 繪製：多子圓疊加 radialGradient，組成雲霧輪廓
      const cx = p.x * dpr
      const cy = p.y * dpr
      const baseR = p.size * dpr

      for (const blob of p.blobs) {
        const bx = cx + blob.ox * baseR
        const by = cy + blob.oy * baseR
        const br = baseR * blob.sr
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br)
        grad.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},${(p.opacity * 0.7).toFixed(3)})`)
        grad.addColorStop(0.5, `rgba(${p.r},${p.g},${p.b},${(p.opacity * 0.3).toFixed(3)})`)
        grad.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`)
        ctx.beginPath()
        ctx.arc(bx, by, br, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }
    }

    rafId = requestAnimationFrame(tick)
  }

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = window.innerWidth
    H = window.innerHeight
    canvas.width  = W * dpr
    canvas.height = H * dpr
    canvas.style.width  = `${W}px`
    canvas.style.height = `${H}px`
  }

  onMounted(() => {
    resize()
    // 預設不生成粒子，只在情緒 hover 時才出現
    tick()
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resize)
  })
}
