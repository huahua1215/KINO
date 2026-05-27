<script setup lang="ts">
import { gsap } from 'gsap'

const emit = defineEmits<{ done: [] }>()
const containerRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const barTopRef = ref<HTMLElement | null>(null)
const barBottomRef = ref<HTMLElement | null>(null)

onMounted(() => {
  gsap.set(textRef.value, { opacity: 0, filter: 'blur(18px)', scale: 1.08 })
  // bars start at letterbox position (74% offscreen so only 13% shows)
  gsap.set(barTopRef.value,    { yPercent: -74 })
  gsap.set(barBottomRef.value, { yPercent:  74 })

  const tl = gsap.timeline({ onComplete: () => emit('done') })

  // Brief darkness
  tl.to({}, { duration: 0.5 })

  // KINO focuses in
  tl.to(textRef.value, {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    duration: 1.5,
    ease: 'power2.out',
  })

  // Hold
  tl.to({}, { duration: 1.2 })

  // Curtain closes — both bars slide to center
  tl.to(barTopRef.value, {
    yPercent: 0,
    duration: 0.85,
    ease: 'power3.inOut',
  })
  tl.to(barBottomRef.value, {
    yPercent: 0,
    duration: 0.85,
    ease: 'power3.inOut',
  }, '<')

  // Fade out
  tl.to(containerRef.value, {
    opacity: 0,
    duration: 0.2,
    ease: 'none',
  }, '-=0.05')
})
</script>

<template>
  <div
    ref="containerRef"
    class="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
  >
    <!-- Film grain -->
    <div class="grain absolute inset-0 pointer-events-none" />

    <!-- Projector ambient glow -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)"
    />

    <!-- Vignette -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.75) 100%)"
    />

    <!-- Title -->
    <span
      ref="textRef"
      class="font-display font-black text-white select-none relative z-10"
      style="font-size: clamp(3.5rem, 12vw, 8rem); letter-spacing: 0.38em; margin-right: -0.38em;"
    >
      KINO
    </span>

    <!-- Letterbox bars — each is 50vh tall, offset so only ~13vh shows initially -->
    <div
      ref="barTopRef"
      class="absolute top-0 left-0 right-0 bg-black z-20"
      style="height: 50vh; transform-origin: top center;"
    />
    <div
      ref="barBottomRef"
      class="absolute bottom-0 left-0 right-0 bg-black z-20"
      style="height: 50vh; transform-origin: bottom center;"
    />
  </div>
</template>

<style scoped>
.grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23g)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 250px 250px;
  mix-blend-mode: overlay;
  opacity: 0.055;
}
</style>
