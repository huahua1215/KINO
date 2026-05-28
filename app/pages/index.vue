<script setup lang="ts">
import { useAnimations } from '~/composables/useAnimations'
import { useTextureWebGL } from '~/composables/useTextureWebGL'
import type { MoodKey } from '~/types/movie'
import { MOOD_MAP } from '~/utils/moodMap'

useSeoMeta({
  title: 'Kino｜依情境探索電影',
  description: '選一個此刻的情境，找到今晚最適合你的電影。6 種情境入口，讓選片變得直覺。',
})

const { animateHeroIn, animateCardsIn } = useAnimations()

const hoveredMood = ref<MoodKey | null>(null)

// Canvas 情緒 WebGL 紋理層（每種情緒獨特的手繪線條紋理）
const textureCanvas = ref<HTMLCanvasElement | null>(null)
useTextureWebGL(textureCanvas, hoveredMood)

// ── 雙層 glow 平滑切換 (Dual-layer Crossfade) ──
const activeLayer = ref(0)
const layer0 = reactive({ visible: false, color1: '#8B6A4B', color2: '#1A2634' })
const layer1 = reactive({ visible: false, color1: '#8B6A4B', color2: '#1A2634' })

// 每種情緒的雙色對：同時用於背景光暈 (color1/color2) 與標題漸層
const MOOD_GLOW_PAIRS: Record<MoodKey, [string, string]> = {
  feel_good:      ['#F5F0D4', '#D4F0E4'],   // washed gold + washed mint
  need_a_cry:     ['#D8EBF8', '#DDD8F2'],   // washed sky + washed lavender
  epic_adventure: ['#F5E0D0', '#F5ECC8'],   // washed peach + washed amber
  friday_night:   ['#C8E4F8', '#EDE8D4'],   // washed sky + washed sand
  date_night:     ['#F8DDE8', '#D0ECF8'],   // washed rose + washed sky
  family_time:    ['#F8F2CC', '#F5E8C0'],   // washed gold + washed amber
}

watch(hoveredMood, (newMood) => {
  if (!newMood) {
    layer0.visible = false
    layer1.visible = false
    return
  }

  const [c1, c2] = MOOD_GLOW_PAIRS[newMood]

  if (activeLayer.value === 0) {
    activeLayer.value = 1
    layer1.color1 = c1
    layer1.color2 = c2
    layer1.visible = true
    layer0.visible = false
  } else {
    activeLayer.value = 0
    layer0.color1 = c1
    layer0.color2 = c2
    layer0.visible = true
    layer1.visible = false
  }
})

// ── 每種情境的光的形狀 (Situation-specific Glow Shapes) ──
const MOOD_SHAPES: Record<string, string> = {
  family_time:    '65% 35% 55% 45% / 50% 60% 40% 55%',
  need_a_cry:     '40% 60% 45% 55% / 70% 30% 60% 40%',
  epic_adventure: '55% 45% 30% 70% / 40% 60% 65% 35%',
  date_night:     '60% 40% 50% 50% / 55% 45% 40% 60%',
  friday_night:   '45% 55% 65% 35% / 55% 45% 35% 65%',
  feel_good:      '50% 50% 35% 65% / 60% 40% 55% 45%',
}
const activeGlowShape = computed(() => {
  if (!hoveredMood.value) return '50%'
  return MOOD_SHAPES[hoveredMood.value] || '50%'
})

// ── 滑鼠跟隨光暈 (Cursor-following Ambient Light) ──
const cursorGlowRef = ref<HTMLElement | null>(null)
let mouseTargetX = 0
let mouseTargetY = 0
let mouseSmoothX = 0
let mouseSmoothY = 0

function onMouseMove(e: MouseEvent) {
  mouseTargetX = e.clientX
  mouseTargetY = e.clientY
}

// ── 背景光自由漂移系統 (Wandering Glow System) ──
// 固定速度 + 碰壁反彈，讓光線每一刻都在移動
const glowTrack0 = ref<HTMLElement | null>(null)
const glowTrack1 = ref<HTMLElement | null>(null)
const glowTrack2 = ref<HTMLElement | null>(null)
const whiteBlob0 = ref<HTMLElement | null>(null)
const whiteBlob1 = ref<HTMLElement | null>(null)
const whiteBlob2 = ref<HTMLElement | null>(null)

interface WanderState {
  x: number; y: number
  vx: number; vy: number  // 固定速度向量
}

function randomAngle() { return Math.random() * Math.PI * 2 }

const wanderers: WanderState[] = [
  { x: 0, y: 0, vx: 0, vy: 0 },
  { x: 0, y: 0, vx: 0, vy: 0 },
  { x: 0, y: 0, vx: 0, vy: 0 },
]
// 每團光的移動速度 (px/frame)
const WANDER_SPEEDS = [0.8, 0.6, 0.7]

function initWanderer(s: WanderState, speed: number) {
  const angle = randomAngle()
  s.vx = Math.cos(angle) * speed
  s.vy = Math.sin(angle) * speed
}

// 可見移動範圍 (相對於光的 CSS 基準位置的偏移量)
const BOUND = 300

let animRafId = 0
function animLoop() {
  // 游標光暈 lerp
  mouseSmoothX += (mouseTargetX - mouseSmoothX) * 0.035
  mouseSmoothY += (mouseTargetY - mouseSmoothY) * 0.035
  if (cursorGlowRef.value) {
    cursorGlowRef.value.style.transform = `translate(${mouseSmoothX}px, ${mouseSmoothY}px) translate(-50%, -50%)`
  }

  // 背景光：固定速度移動 + 碰壁柔和反彈
  const tracks = [glowTrack0.value, glowTrack1.value, glowTrack2.value]
  const whites = [whiteBlob0.value, whiteBlob1.value, whiteBlob2.value]
  for (let i = 0; i < wanderers.length; i++) {
    const s = wanderers[i]
    s.x += s.vx
    s.y += s.vy

    // 碰壁反彈（加上隨機擾動避免來回直線）
    if (s.x > BOUND || s.x < -BOUND) {
      s.vx = -s.vx
      s.vy += (Math.random() - 0.5) * 0.3
    }
    if (s.y > BOUND || s.y < -BOUND) {
      s.vy = -s.vy
      s.vx += (Math.random() - 0.5) * 0.3
    }

    // 保持速率穩定（避免擾動累積導致加速或減速）
    const speed = WANDER_SPEEDS[i]
    const mag = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
    if (mag > 0) {
      s.vx = (s.vx / mag) * speed
      s.vy = (s.vy / mag) * speed
    }

    if (!s) continue
    const t = `translate(${s.x}px, ${s.y}px)`
    if (tracks[i]) tracks[i]!.style.transform = t
    if (whites[i]) whites[i]!.style.transform = t
  }

  animRafId = requestAnimationFrame(animLoop)
}

// 當情境變化時更新游標光暈
watch(hoveredMood, (m) => {
  if (cursorGlowRef.value) {
    cursorGlowRef.value.style.backgroundColor = m ? MOOD_MAP[m].color : '#aaaaaa'
    cursorGlowRef.value.style.opacity = m ? '0.2' : '0.06'
  }
})

const heroTitleRef = ref<HTMLElement | null>(null)
const moodGridRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const heroEls = [heroTitleRef.value].filter(Boolean) as HTMLElement[]
  animateHeroIn(heroEls)

  setTimeout(() => {
    if (moodGridRef.value) {
      animateCardsIn('.mood-btn', 0.1)
    }
  }, 300)

  // 初始化滑鼠位置 + 漂移目標
  mouseSmoothX = window.innerWidth / 2
  mouseSmoothY = window.innerHeight / 2
  mouseTargetX = mouseSmoothX
  mouseTargetY = mouseSmoothY
  for (let i = 0; i < wanderers.length; i++) initWanderer(wanderers[i], WANDER_SPEEDS[i])

  window.addEventListener('mousemove', onMouseMove)
  animLoop()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  cancelAnimationFrame(animRafId)
})

function handleMoodSelect(_mood: MoodKey) {
  // navigation handled inside MoodSelector
}
</script>

<template>
  <!-- 確保整體背景是純黑 -->
  <div class="min-h-dvh flex flex-col relative bg-black">

    <!-- 滑鼠跟隨光暈 (Cursor Ambient Light) -->
    <div
      ref="cursorGlowRef"
      class="fixed top-0 left-0 pointer-events-none z-[1] rounded-full transform-gpu"
      style="width: 45vw; height: 45vw; filter: blur(120px); opacity: 0.06; background-color: #aaaaaa; will-change: transform; transition: opacity 0.8s ease, background-color 0.8s ease;"
    />
    
    <!-- 統一的背景特效層 (固定覆蓋全螢幕，消除區塊斷層) -->
    <!-- isolate：將所有 mix-blend-mode 限制在此容器內，不影響外部 UI 文字 -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden isolate">
      <!-- 1. 電影暗角 (Vignette) - Hover 時稍微變淡讓顏色透出來 -->
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000_110%)] z-20 transition-opacity duration-1000"
        :class="hoveredMood ? 'opacity-65' : 'opacity-75'"
      ></div>

      <!-- 預設白灰霧氣 blobs (z-[25] 在 vignette 上方，與漂移 tracks 同步移動)
           大尺寸 + 超重模糊讓三球互相滲透成連續霧氣，而非三個光球 -->
      <div ref="whiteBlob0" class="absolute top-[-20%] left-[-10vw] z-[25] pointer-events-none transform-gpu" style="will-change: transform;">
        <div style="width: 110vw; height: 80vh; border-radius: 50%; filter: blur(140px);"
             :style="{ background: 'radial-gradient(ellipse at 40% 50%, #ffffff 0%, #cccccc 35%, transparent 70%)', opacity: hoveredMood ? 0 : 0.32, transition: 'opacity 1.2s ease' }" />
      </div>
      <div ref="whiteBlob1" class="absolute bottom-[-20%] right-[-10vw] z-[25] pointer-events-none transform-gpu" style="will-change: transform;">
        <div style="width: 100vw; height: 75vh; border-radius: 50%; filter: blur(150px);"
             :style="{ background: 'radial-gradient(ellipse at 60% 55%, #e0e0e0 0%, #aaaaaa 40%, transparent 72%)', opacity: hoveredMood ? 0 : 0.28, transition: 'opacity 1.2s ease' }" />
      </div>
      <div ref="whiteBlob2" class="absolute top-[20%] left-[20vw] z-[25] pointer-events-none transform-gpu" style="will-change: transform;">
        <div style="width: 80vw; height: 70vh; border-radius: 50%; filter: blur(130px);"
             :style="{ background: 'radial-gradient(ellipse at 50% 45%, #ebebeb 0%, #b0b0b0 38%, transparent 68%)', opacity: hoveredMood ? 0 : 0.22, transition: 'opacity 1.2s ease' }" />
      </div>

      <!-- 電影底片顆粒微紋理 (Film Grain) -->
      <!-- z-[15]：高於 canvas(10)，低於 vignette(20)；isolate 限制 blend 不外洩 -->
      <div class="film-grain absolute inset-0 z-[15] pointer-events-none" />

      <!-- 情緒紋理 Canvas（每種情緒的獨特手繪線條底紋，z-[7] 在光暈上方、粒子下方） -->
      <canvas
        ref="textureCanvas"
        class="absolute inset-0 z-[7] pointer-events-none"
        style="opacity: 0; transition: opacity 0.45s ease; width: 100%; height: 100%;"
      />


      <!-- 2. 電影院光束 -->
      <div class="absolute top-0 left-[10%] w-[50vw] h-[90vh] bg-gradient-to-b from-white/[0.06] to-transparent rotate-[-25deg] origin-top-left blur-[80px] transform-gpu animate-beam-1" />
      <div class="absolute top-0 right-[10%] w-[45vw] h-[85vh] bg-gradient-to-b from-white/[0.04] to-transparent rotate-[30deg] origin-top-right blur-[80px] transform-gpu animate-beam-2" />

      <!-- 3. 漂移光暈系統 (Wandering Glow Tracks) — radial-gradient 讓中心亮、邊緣自然消散 -->
      <!-- Track 0: 上方主光 -->
      <div ref="glowTrack0" class="absolute top-[-5%] left-[10vw] transform-gpu" style="will-change: transform;">
        <div class="w-[70vw] max-w-[900px] h-[55vh] rounded-[50%] blur-[90px] transform-gpu"
             style="background: radial-gradient(ellipse at center, #555555 0%, transparent 72%); opacity: 0.06;" />
        <div class="absolute inset-0 blur-[90px] transform-gpu"
             :style="{ background: `radial-gradient(ellipse at center, ${layer0.color1} 0%, transparent 72%)`, borderRadius: activeGlowShape, opacity: layer0.visible ? 0.55 : 0, transition: 'opacity 0.7s ease-out, border-radius 1.2s ease' }" />
        <div class="absolute inset-0 blur-[90px] transform-gpu"
             :style="{ background: `radial-gradient(ellipse at center, ${layer1.color1} 0%, transparent 72%)`, borderRadius: activeGlowShape, opacity: layer1.visible ? 0.55 : 0, transition: 'opacity 0.7s ease-out, border-radius 1.2s ease' }" />
      </div>

      <!-- Track 1: 右下漫射 -->
      <div ref="glowTrack1" class="absolute bottom-[-15%] right-[-10vw] transform-gpu" style="will-change: transform;">
        <div class="w-[65vw] h-[65vh] rounded-full blur-[100px] transform-gpu"
             style="background: radial-gradient(ellipse at center, #444444 0%, transparent 70%); opacity: 0.05;" />
        <div class="absolute inset-0 blur-[100px] transform-gpu"
             :style="{ background: `radial-gradient(ellipse at center, ${layer0.color2} 0%, transparent 70%)`, borderRadius: activeGlowShape, opacity: layer0.visible ? 0.42 : 0, transition: 'opacity 0.7s ease-out, border-radius 1.2s ease' }" />
        <div class="absolute inset-0 blur-[100px] transform-gpu"
             :style="{ background: `radial-gradient(ellipse at center, ${layer1.color2} 0%, transparent 70%)`, borderRadius: activeGlowShape, opacity: layer1.visible ? 0.42 : 0, transition: 'opacity 0.7s ease-out, border-radius 1.2s ease' }" />
      </div>

      <!-- Track 2: 左側點綴 -->
      <div ref="glowTrack2" class="absolute top-[35%] left-[-15vw] transform-gpu" style="will-change: transform;">
        <div class="w-[45vw] h-[50vh] rounded-full blur-[80px] transform-gpu"
             style="background: radial-gradient(ellipse at center, #4a4a4a 0%, transparent 70%); opacity: 0.05;" />
        <div class="absolute inset-0 blur-[80px] transform-gpu"
             :style="{ background: `radial-gradient(ellipse at center, ${layer0.color1} 0%, transparent 70%)`, borderRadius: activeGlowShape, opacity: layer0.visible ? 0.32 : 0, transition: 'opacity 0.7s ease-out, border-radius 1.2s ease' }" />
        <div class="absolute inset-0 blur-[80px] transform-gpu"
             :style="{ background: `radial-gradient(ellipse at center, ${layer1.color1} 0%, transparent 70%)`, borderRadius: activeGlowShape, opacity: layer1.visible ? 0.32 : 0, transition: 'opacity 0.7s ease-out, border-radius 1.2s ease' }" />
      </div>
    </div>

    <!-- Main: flex-1 讓此區塊撐滿 header 以下的剩餘高度，justify-center 垂直置中 -->
    <main class="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10 z-10 relative">
      <div
        class="max-w-4xl mx-auto w-full flex flex-col items-center gap-5 sm:gap-10 md:gap-20"
        :style="hoveredMood ? `--hglow: ${MOOD_GLOW_PAIRS[hoveredMood][0]}; --hglow2: ${MOOD_GLOW_PAIRS[hoveredMood][1]}` : ''"
      >
        <div ref="heroTitleRef" class="opacity-0 w-full text-center">
          <h1 class="font-display text-2xl sm:text-5xl text-white leading-[1.3] tracking-wide">
            <span class="hero-line2 font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8E0D0]/80 via-[#D8CFC0]/65 to-[#C8C0B0]/45 block pb-2">
              選一個此刻的情境
            </span>
          </h1>
        </div>

        <div ref="moodGridRef" class="w-full">
          <MoodSelector
            @select="handleMoodSelect"
            @hover="hoveredMood = $event"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 電影底片顆粒微紋理 */
/* mix-blend-mode: overlay 讓顆粒只在光暈區域顯現，純黑區幾乎不可見 */
/* isolate 在容器上已限制 blend scope，不影響 UI 文字層 */
.film-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23g)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 250px 250px;
  mix-blend-mode: overlay;
  opacity: 0.04;
}

@keyframes beam-swing-1 {
  0%, 100% { transform: rotate(-25deg); opacity: 0.05; }
  25% { opacity: 0.07; }
  50% { transform: rotate(-20deg); opacity: 0.04; }
  75% { opacity: 0.06; }
}
@keyframes beam-swing-2 {
  0%, 100% { transform: rotate(30deg); opacity: 0.04; }
  25% { opacity: 0.05; }
  50% { transform: rotate(25deg); opacity: 0.03; }
  75% { opacity: 0.05; }
}

/* 電影院微塵上升動畫 */
@keyframes dust-float-1 {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  20% { opacity: 0.4; }
  80% { opacity: 0.4; }
  100% { transform: translate(15vw, -110vh) scale(1.5); opacity: 0; }
}
@keyframes dust-float-2 {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  20% { opacity: 0.3; }
  80% { opacity: 0.3; }
  100% { transform: translate(-10vw, -110vh) scale(1.2); opacity: 0; }
}
@keyframes dust-float-3 {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  20% { opacity: 0.5; }
  80% { opacity: 0.5; }
  100% { transform: translate(5vw, -110vh) scale(0.8); opacity: 0; }
}

.animate-beam-1 { animation: beam-swing-1 15s ease-in-out infinite; }
.animate-beam-2 { animation: beam-swing-2 18s ease-in-out infinite; }



/* ── Hero text mood effects ── */
.hero-line1 {
  transition: color 0.6s ease, text-shadow 0.6s ease;
}
.hero-line2 {
  display: block;
  transition: background-image 0.6s ease;
}
[style*="--hglow"] .hero-line2 {
  background-image: linear-gradient(to right, var(--hglow), var(--hglow2, var(--hglow)));
}


.animate-dust-1 { animation: dust-float-1 25s linear infinite; }
.animate-dust-2 { animation: dust-float-2 35s linear infinite; }
.animate-dust-3 { animation: dust-float-3 28s linear infinite; }
</style>
