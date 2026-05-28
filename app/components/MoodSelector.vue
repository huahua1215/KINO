<script setup lang="ts">
import { MOOD_MAP, MOOD_KEYS } from '~/utils/moodMap'
import type { MoodKey } from '~/types/movie'
import { useAnimations } from '~/composables/useAnimations'

const emit = defineEmits<{
  select: [mood: MoodKey]
  hover: [mood: MoodKey | null]
}>()

const { addMoodButtonHover, addIconDrawAnimation } = useAnimations()
const router = useRouter()

const MOOD_BLOB_COLORS: Record<MoodKey, [string, string, string]> = {
  feel_good:      ['#D4B86A', '#C08890', '#6EA888'],
  need_a_cry:     ['#4A5E8A', '#6A5688', '#3A6878'],
  epic_adventure: ['#9A5248', '#A87848', '#906048'],
  friday_night:   ['#7898A8', '#7898A0', '#A89E8A'],
  date_night:     ['#B08070', '#6890A0', '#B07880'],
  family_time:    ['#A07840', '#A88840', '#987840'],
}

const moodRefs = ref<(Element | null)[]>([])
const cleanupFns: Array<() => void> = []
const hoveredKey = ref<MoodKey | null>(null)
const activeKey = ref<MoodKey | null>(null)   // mobile 預覽狀態
const isTouchDevice = ref(false)

onMounted(() => {
  isTouchDevice.value = window.matchMedia('(hover: none)').matches

  moodRefs.value.forEach((el, i) => {
    if (!el) return
    const key = MOOD_KEYS[i]
    cleanupFns.push(addMoodButtonHover(el, MOOD_MAP[key].color))
    const isSequential = key === 'family_time' || key === 'epic_adventure'
    cleanupFns.push(addIconDrawAnimation(el, isSequential))
  })

  // 點卡片外部 → 清除預覽狀態
  const clearOnOutside = (e: Event) => {
    if (activeKey.value && !(e.target as Element).closest('.mood-btn')) {
      activeKey.value = null
      hoveredKey.value = null
      emit('hover', null)
    }
  }
  document.addEventListener('click', clearOnOutside)
  onUnmounted(() => document.removeEventListener('click', clearOnOutside))
})

onUnmounted(() => {
  cleanupFns.forEach((fn) => fn())
})

function handleCardClick(key: MoodKey) {
  if (!isTouchDevice.value) {
    // 桌面：直接導航
    emit('select', key)
    router.push(`/movies/${key}`)
    return
  }

  if (activeKey.value === key) {
    // 第二下：導航
    emit('select', key)
    router.push(`/movies/${key}`)
  } else {
    // 第一下：進入預覽
    activeKey.value = key
    hoveredKey.value = key
    emit('hover', key)
  }
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-10">
    <button
      v-for="(key, i) in MOOD_KEYS"
      :key="key"
      :ref="(el) => (moodRefs[i] = el as Element)"
      class="mood-btn group relative flex flex-col items-center justify-center gap-1 sm:gap-2
             p-4 sm:p-8 rounded-xl sm:rounded-2xl glass
             cursor-pointer transition-opacity duration-300 active:scale-95"
      :class="[
        hoveredKey && hoveredKey !== key ? 'opacity-35' : '',
        hoveredKey === key ? 'is-hovered' : '',
        activeKey === key ? 'is-active' : '',
      ]"
      :style="`--mood-color: ${MOOD_MAP[key].color}; --mood-glow: ${MOOD_MAP[key].glowColor ?? MOOD_MAP[key].color}; --blob-boost: ${key === 'family_time' ? 1.6 : 1}`"
      @click="handleCardClick(key)"
      @mouseenter="!isTouchDevice && (hoveredKey = key, emit('hover', key))"
      @mouseleave="!isTouchDevice && (hoveredKey = null, emit('hover', null))"
    >
      <!-- 脈衝光圈邊框（mobile 預覽狀態） -->
      <span class="pulse-ring" />

      <!-- Blob background -->
      <div class="blob-stage absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none">
        <div class="blob blob-a" :style="`background: ${MOOD_BLOB_COLORS[key][0]}`" />
        <div class="blob blob-b" :style="`background: ${MOOD_BLOB_COLORS[key][1]}`" />
        <div class="blob blob-c" :style="`background: ${MOOD_BLOB_COLORS[key][2]}`" />
      </div>

      <!-- Icon -->
      <span class="icon-wrap transition-transform duration-300 group-hover:scale-110 relative z-10">
        <MoodIcon :mood="key" :size="56" />
      </span>

      <!-- Label -->
      <span class="label-text font-display font-bold text-sm sm:text-xl relative z-10">
        {{ MOOD_MAP[key].label }}
      </span>

      <!-- Description -->
      <span class="desc-text text-xs sm:text-base text-center relative z-10 leading-tight">
        {{ MOOD_MAP[key].description }}
      </span>

      <!-- 引導提示（標題下方，永遠佔位避免高度跳動） -->
      <span class="enter-hint relative z-10" :class="activeKey === key ? 'hint-visible' : 'hint-hidden'">
        點擊進入 →
      </span>
    </button>
  </div>
</template>

<style scoped>
/* ── Icon ── */
.icon-wrap {
  color: white;
  filter: drop-shadow(0 0 0px transparent);
  transition: filter 0.3s ease, transform 0.3s ease;
}
.icon-wrap :deep(svg) { width: 40px; height: 40px; }
@media (min-width: 640px) {
  .icon-wrap :deep(svg) { width: 56px; height: 56px; }
}
.group:hover .icon-wrap,
.is-hovered .icon-wrap {
  filter: drop-shadow(0 0 12px var(--mood-glow)) drop-shadow(0 0 6px var(--mood-glow)) drop-shadow(0 0 2px white);
  transform: scale(1.1);
}

/* ── Text ── */
.label-text {
  color: white;
  transition: text-shadow 0.35s ease;
}
.group:hover .label-text,
.is-hovered .label-text {
  text-shadow: 0 0 16px rgba(255,255,255,0.85), 0 0 6px rgba(255,255,255,0.6);
}
.desc-text {
  color: rgba(255,255,255,0.50);
  transition: color 0.35s ease;
}
.group:hover .desc-text,
.is-hovered .desc-text {
  color: rgba(255,255,255,0.78);
}

/* ── 引導提示 ── */
.enter-hint {
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.06em;
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.hint-visible {
  opacity: 0.45;
  color: white;
  transform: translateY(0);
}
.hint-hidden {
  opacity: 0;
  transform: translateY(3px);
  pointer-events: none;
}

/* ── 脈衝光暈 ── */
.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 0 10px 2px var(--mood-glow);
  opacity: 0;
  pointer-events: none;
}
.is-active .pulse-ring {
  animation: pulse-glow 1.6s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% { opacity: 0.15; }
  50%       { opacity: 0.5; }
}

/* ── Blob ── */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(26px);
  opacity: 0;
  transition: opacity 0.5s ease;
}
.blob-a { width: 75%; height: 75%; top: -20%; left: -15%; }
.blob-b { width: 60%; height: 60%; bottom: -15%; right: -10%; }
.blob-c { width: 45%; height: 45%; top: 20%; left: 25%; }

.group:hover .blob-a,
.is-hovered .blob-a {
  opacity: calc(0.42 * var(--blob-boost, 1));
  animation: blob-drift-a 7s ease-in-out infinite;
}
.group:hover .blob-b,
.is-hovered .blob-b {
  opacity: calc(0.32 * var(--blob-boost, 1));
  animation: blob-drift-b 9s ease-in-out infinite;
  animation-delay: -3.2s;
}
.group:hover .blob-c,
.is-hovered .blob-c {
  opacity: calc(0.18 * var(--blob-boost, 1));
  animation: blob-drift-c 6s ease-in-out infinite;
  animation-delay: -1.5s;
}

@keyframes blob-drift-a {
  0%   { transform: translate(0,    0)    scale(1); }
  25%  { transform: translate(20%,  14%)  scale(1.07); }
  50%  { transform: translate(6%,   30%)  scale(0.96); }
  75%  { transform: translate(-14%, 18%)  scale(1.04); }
  100% { transform: translate(0,    0)    scale(1); }
}
@keyframes blob-drift-b {
  0%   { transform: translate(0,    0)    scale(1); }
  30%  { transform: translate(-16%, -12%) scale(1.05); }
  55%  { transform: translate(12%,  -22%) scale(0.93); }
  80%  { transform: translate(18%,  -6%)  scale(1.03); }
  100% { transform: translate(0,    0)    scale(1); }
}
@keyframes blob-drift-c {
  0%   { transform: translate(0,    0); }
  35%  { transform: translate(-14%, 12%); }
  65%  { transform: translate(12%,  -10%); }
  100% { transform: translate(0,    0); }
}
</style>
