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

// Shader-derived colors — dark moods use brightened variants for card visibility
const MOOD_BLOB_COLORS: Record<MoodKey, [string, string, string]> = {
  feel_good:      ['#F5D133', '#F26185', '#47C78C'],  // gold, peach pink, mint
  need_a_cry:     ['#2D4B9E', '#6644AA', '#1E7090'],  // brightened navy, purple, teal
  epic_adventure: ['#C42E1C', '#CC7E10', '#C45A14'],  // bright crimson, amber, deep orange
  friday_night:   ['#7AB8E0', '#85C2B8', '#E0D6B8'],  // sky blue, soft teal, warm sand
  date_night:     ['#FC8A70', '#4DBFF2', '#FC85AD'],  // coral, sky blue, pink
  family_time:    ['#D4841C', '#E4A818', '#CCA040'],  // bright amber, bright gold, warm gold
}

const moodRefs = ref<(Element | null)[]>([])
const cleanupFns: Array<() => void> = []
const hoveredKey = ref<MoodKey | null>(null)

onMounted(() => {
  moodRefs.value.forEach((el, i) => {
    if (!el) return
    const key = MOOD_KEYS[i]
    cleanupFns.push(addMoodButtonHover(el, MOOD_MAP[key].color))
    const isSequential = key === 'family_time' || key === 'epic_adventure'
    cleanupFns.push(addIconDrawAnimation(el, isSequential))
  })
})

onUnmounted(() => {
  cleanupFns.forEach((fn) => fn())
})

function handleSelect(key: MoodKey) {
  emit('select', key)
  router.push(`/movies/${key}`)
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-10">
    <button
      v-for="(key, i) in MOOD_KEYS"
      :key="key"
      :ref="(el) => (moodRefs[i] = el as Element)"
      class="mood-btn group relative flex flex-col items-center justify-center gap-2
             p-6 sm:p-8 rounded-2xl glass
             cursor-pointer transition-opacity duration-300 active:scale-95"
      :class="hoveredKey && hoveredKey !== key ? 'opacity-35' : ''"
      :style="`--mood-color: ${MOOD_MAP[key].color}; --mood-glow: ${MOOD_MAP[key].glowColor ?? MOOD_MAP[key].color}; --blob-boost: ${key === 'family_time' ? 1.6 : 1}`"
      @click="handleSelect(key)"
      @mouseenter="hoveredKey = key; emit('hover', key)"
      @mouseleave="hoveredKey = null; emit('hover', null)"
    >
      <!-- Blob background — only visible on hover, clips inside card -->
      <div class="blob-stage absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div class="blob blob-a" :style="`background: ${MOOD_BLOB_COLORS[key][0]}`" />
        <div class="blob blob-b" :style="`background: ${MOOD_BLOB_COLORS[key][1]}`" />
        <div class="blob blob-c" :style="`background: ${MOOD_BLOB_COLORS[key][2]}`" />
      </div>

      <!-- Custom drawn icon -->
      <span class="icon-wrap transition-transform duration-300 group-hover:scale-110 relative z-10">
        <MoodIcon :mood="key" :size="56" />
      </span>

      <!-- Label -->
      <span class="label-text font-display font-bold text-lg sm:text-xl relative z-10">
        {{ MOOD_MAP[key].label }}
      </span>

      <!-- Description -->
      <span class="desc-text text-base text-center relative z-10 leading-tight">
        {{ MOOD_MAP[key].description }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.icon-wrap {
  color: white;
  filter: drop-shadow(0 0 0px transparent);
  transition: filter 0.3s ease;
}
.group:hover .icon-wrap {
  filter: drop-shadow(0 0 12px var(--mood-glow)) drop-shadow(0 0 6px var(--mood-glow)) drop-shadow(0 0 2px white);
}

/* Text hover transitions */
.label-text {
  color: white;
  transition: color 0.35s ease;
}
.group:hover .label-text {
  color: white;
  text-shadow: 0 0 16px rgba(255,255,255,0.85), 0 0 6px rgba(255,255,255,0.6);
}
.desc-text {
  color: rgba(255, 255, 255, 0.50);
  transition: color 0.35s ease;
}
.group:hover .desc-text {
  color: rgba(255, 255, 255, 0.78);
}

/* Blob base */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(26px);
  opacity: 0;
  transition: opacity 0.5s ease;
}
.blob-a {
  width: 75%;
  height: 75%;
  top: -20%;
  left: -15%;
}
.blob-b {
  width: 60%;
  height: 60%;
  bottom: -15%;
  right: -10%;
}
.blob-c {
  width: 45%;
  height: 45%;
  top: 20%;
  left: 25%;
}

/* Hover: fade in + animate — desynchronized for organic feel */
.group:hover .blob-a {
  opacity: calc(0.42 * var(--blob-boost, 1));
  animation: blob-drift-a 7s ease-in-out infinite;
  animation-delay: 0s;
}
.group:hover .blob-b {
  opacity: calc(0.32 * var(--blob-boost, 1));
  animation: blob-drift-b 9s ease-in-out infinite;
  animation-delay: -3.2s;
}
.group:hover .blob-c {
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
