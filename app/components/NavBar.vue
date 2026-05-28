<script setup lang="ts">
import { useFavoritesStore } from '~/stores/favorites'

const favStore = useFavoritesStore()
const route = useRoute()

const isScrolled = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20
  })
})
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="isScrolled ? 'glass-dark shadow-glow-sm' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-12 sm:h-16">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center gap-3 group"
        >
          <span class="font-display font-bold text-sm sm:text-lg tracking-widest uppercase text-white/90">
            Kino
          </span>
        </NuxtLink>

        <!-- Nav Links -->
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/favorites"
            class="flex items-center gap-1.5 sm:gap-2  rounded-full text-sm sm:text-base font-medium transition-all duration-300 hover:bg-white/10"
            :class="route.path === '/favorites'
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-white/70 hover:text-white'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                :fill="route.path === '/favorites' ? 'currentColor' : 'none'"
              />
            </svg>
            <span>收藏</span>
            <span
              v-if="favStore.count > 0"
              class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-white/20 text-white"
            >
              {{ favStore.count > 99 ? '99+' : favStore.count }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.brand-text {
  background: linear-gradient(90deg,
    #D4C090, #C49898, #90B0C8, #90B8A0, #C8A090, #D4C090
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-flow 6s linear infinite;
}

@keyframes text-flow {
  from { background-position: 0% center; }
  to   { background-position: 200% center; }
}
</style>
