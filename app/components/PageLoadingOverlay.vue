<script setup lang="ts">
import { gsap } from 'gsap'
import { MOOD_MAP } from '~/utils/moodMap'
import type { MoodKey } from '~/types/movie'

const props = defineProps<{
  show: boolean
  mood: string | null
}>()

const config = computed(() => {
  if (!props.mood || !(props.mood in MOOD_MAP)) return null
  return MOOD_MAP[props.mood as MoodKey]
})

const iconRef = ref<HTMLElement | null>(null)
let tl: gsap.core.Timeline | null = null

function startLoop() {
  if (!iconRef.value) return
  const svg = iconRef.value.querySelector('svg')
  if (!svg) return

  const candidates = Array.from(svg.querySelectorAll('path, line, circle, ellipse, polyline'))

  const strokeEls: { el: SVGGeometryElement; len: number }[] = []
  const fillEls: Element[] = []

  candidates.forEach((s) => {
    const fill   = s.getAttribute('fill')   ?? s.parentElement?.getAttribute('fill')   ?? 'none'
    const stroke = s.getAttribute('stroke') ?? s.parentElement?.getAttribute('stroke') ?? 'none'
    const geo = s as SVGGeometryElement

    if (stroke !== 'none' && fill === 'none' && typeof geo.getTotalLength === 'function') {
      try {
        const len = geo.getTotalLength()
        if (len > 0) strokeEls.push({ el: geo, len })
      } catch {}
    } else {
      fillEls.push(s)
    }
  })

  // Initial hidden state
  strokeEls.forEach(({ el, len }) => gsap.set(el, { strokeDasharray: len, strokeDashoffset: len }))
  gsap.set(fillEls, { opacity: 0 })

  tl = gsap.timeline({ repeat: -1, repeatDelay: 0.15 })

  // Draw strokes in sequentially
  if (strokeEls.length) {
    tl.to(strokeEls.map(({ el }) => el), {
      strokeDashoffset: 0,
      duration: 0.55,
      stagger: 0.07,
      ease: 'power2.inOut',
    })
  }

  // Fade fill elements in
  if (fillEls.length) {
    tl.to(fillEls, {
      opacity: 1,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.out',
    }, strokeEls.length ? '-=0.3' : '0')
  }

  // Hold
  tl.to({}, { duration: 0.35 })

  // Fade everything out
  const allEls = [...strokeEls.map(({ el }) => el), ...fillEls]
  if (allEls.length) {
    tl.to(allEls, { opacity: 0, duration: 0.4, ease: 'power2.in' })
  }

  // Reset before next loop
  tl.call(() => {
    strokeEls.forEach(({ el, len }) => {
      gsap.set(el, { strokeDashoffset: len, opacity: 1 })
    })
    gsap.set(fillEls, { opacity: 0 })
  })
}

watch(() => props.show, (visible) => {
  if (visible) {
    nextTick(startLoop)
  } else {
    tl?.kill()
    tl = null
  }
})

onUnmounted(() => {
  tl?.kill()
})
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    leave-active-class="transition-opacity duration-400 ease-in"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
    >
      <!-- Icon only -->
      <div
        ref="iconRef"
        class="relative"
        :style="config ? { color: config.color } : { color: 'white' }"
      >
        <MoodIcon
          v-if="props.mood && props.mood in MOOD_MAP"
          :mood="(props.mood as MoodKey)"
          :size="80"
        />
        <span v-else class="text-[80px] leading-none">🎬</span>
      </div>
    </div>
  </Transition>
</template>
