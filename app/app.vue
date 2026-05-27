<script setup lang="ts">
import { useFavoritesStore } from '~/stores/favorites'

const favStore = useFavoritesStore()

onMounted(() => {
  favStore.loadFromStorage()
})

// Intro screen — once per session
const showIntro = ref(import.meta.client && !sessionStorage.getItem('kino-intro-seen'))

function onIntroDone() {
  showIntro.value = false
  sessionStorage.setItem('kino-intro-seen', '1')
}

const isNavigating = ref(false)
const navigatingMood = ref<string | null>(null)
const showPage = ref(true)

// overlay leave transition duration (must match PageLoadingOverlay leave-active-class)
const OVERLAY_LEAVE_MS = 400
// Minimum duration for loading overlay — ensures at least one full animation cycle
const MIN_LOADING_MS = 2400

let loadingStartTime = 0
let minTimer: ReturnType<typeof setTimeout> | null = null
let showTimer: ReturnType<typeof setTimeout> | null = null

function dismissLoading() {
  const elapsed = Date.now() - loadingStartTime
  const remaining = MIN_LOADING_MS - elapsed

  if (minTimer) clearTimeout(minTimer)

  const hide = () => {
    isNavigating.value = false
    // Show page only after overlay leave animation completes
    if (showTimer) clearTimeout(showTimer)
    showTimer = setTimeout(() => {
      showPage.value = true
      showTimer = null
    }, OVERLAY_LEAVE_MS)
  }

  if (remaining > 0) {
    minTimer = setTimeout(() => { hide(); minTimer = null }, remaining)
  } else {
    hide()
  }
}
provide('dismissLoading', dismissLoading)

if (import.meta.client) {
  const router = useRouter()

  router.beforeEach((to) => {
    if (to.path.startsWith('/movies/')) {
      if (minTimer) { clearTimeout(minTimer); minTimer = null }
      if (showTimer) { clearTimeout(showTimer); showTimer = null }
      navigatingMood.value = to.params.mood as string
      isNavigating.value = true
      showPage.value = false
      loadingStartTime = Date.now()
    }
  })

  router.afterEach((to) => {
    if (!to.path.startsWith('/movies/')) {
      if (minTimer) { clearTimeout(minTimer); minTimer = null }
      if (showTimer) { clearTimeout(showTimer); showTimer = null }
      isNavigating.value = false
      showPage.value = true
    }
  })
}
</script>

<template>
  <div class="bg-cinema-950 min-h-dvh">
    <NavBar />
    <div :style="showPage ? '' : 'visibility: hidden'">
      <NuxtPage />
    </div>
    <PageLoadingOverlay :show="isNavigating" :mood="navigatingMood" />
    <IntroScreen v-if="showIntro" @done="onIntroDone" />
  </div>
</template>
