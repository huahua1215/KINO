<script setup lang="ts">
import { useFavoritesStore } from '~/stores/favorites'
import type { Movie, MovieDetail } from '~/types/movie'

useSeoMeta({
  title: '我的收藏 | Kino',
  description: '查看你所有收藏的電影清單',
})

const favStore = useFavoritesStore()

const selectedMovie = ref<Movie | null>(null)
const movieDetail = ref<MovieDetail | null>(null)
const detailLoading = ref(false)

async function openModal(movie: Movie) {
  selectedMovie.value = movie
  movieDetail.value = null
  detailLoading.value = true
  try {
    const detail = await $fetch<MovieDetail>('/api/tmdb', {
      params: { endpoint: `movie/${movie.id}` },
    })
    movieDetail.value = detail
  } catch {
    console.warn('[Favorites Modal] Failed to fetch detail')
  } finally {
    detailLoading.value = false
  }
}

function closeModal() {
  selectedMovie.value = null
  movieDetail.value = null
}
</script>

<template>
  <div class="min-h-dvh">
    <!-- Ambient -->
    <div
class="fixed inset-0 pointer-events-none -z-0"
      style="background: radial-gradient(ellipse 60% 40% at 50% -5%, rgba(255,180,100,0.08) 0%, transparent 70%)" />

    <!-- Header -->
    <div class="relative z-10 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors duration-200 mb-6">
          ← 返回探索
        </NuxtLink>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-display font-black text-3xl sm:text-4xl text-white mb-3">
              我的收藏
            </h1>
            <p v-if="favStore.count > 0" class="text-white/50 text-sm">
              共 {{ favStore.count }} 部電影
            </p>
          </div>
          <button
            v-if="favStore.count > 0"
            class="text-xs text-white/40 hover:text-red-400 transition-colors duration-200 px-3 py-1.5 rounded-full border border-white/10 hover:border-red-400/30"
            @click="favStore.clearAll()"
          >
            清空全部
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <main class="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
      <div class="max-w-7xl mx-auto">
        <!-- Empty state -->
        <div v-if="favStore.count === 0" class="flex flex-col items-center justify-center py-24 text-center">
          <svg width="72" height="72" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-6 opacity-70">
            <!-- Board body -->
            <rect x="8" y="20" width="40" height="28" rx="2.5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Clapper top strip -->
            <rect x="8" y="12" width="40" height="10" rx="2" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Diagonal stripes on clapper -->
            <line x1="18" y1="12" x2="14" y2="22" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="26" y1="12" x2="22" y2="22" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="34" y1="12" x2="30" y2="22" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="42" y1="12" x2="38" y2="22" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
            <!-- Film holes on body -->
            <circle cx="16" cy="32" r="2.5" stroke="white" stroke-width="1.4"/>
            <circle cx="28" cy="32" r="2.5" stroke="white" stroke-width="1.4"/>
            <circle cx="40" cy="32" r="2.5" stroke="white" stroke-width="1.4"/>
            <!-- Bottom line detail -->
            <line x1="14" y1="41" x2="42" y2="41" stroke="white" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
          </svg>
          <h2 class="font-display text-2xl text-white mb-3">收藏夾是空的</h2>
          <p class="text-white/50 mb-8 max-w-sm">去探索不同的心情電影，點擊愛心加入收藏吧！</p>
          <NuxtLink
            to="/"
            class="btn-primary font-bold text-white text-lg explore-btn"
          >
            開始探索
          </NuxtLink>
        </div>

        <!-- Movie grid -->
        <div
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <MovieCard
            v-for="movie in favStore.items"
            :key="movie.id"
            :movie="movie"
            @click="openModal(movie)"
          />
        </div>
      </div>
    </main>

    <!-- Modal -->
    <Teleport to="body">
      <MovieModal
        v-if="selectedMovie"
        :movie="selectedMovie"
        :detail="movieDetail"
        :is-loading="detailLoading"
        @close="closeModal"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.explore-btn {
  background: linear-gradient(135deg, #B8A070, #A87878, #6A90A8, #B8A070, #6A9880, #A87878, #A88070, #6A90A8, #B8A070);
  background-size: 400% 400%;
  animation: btn-flow 9s ease-in-out infinite;
}
.explore-btn:hover {
  filter: brightness(1.1);
}

@keyframes btn-flow {
  0%   { background-position: 0%   30%; }
  20%  { background-position: 80%  10%; }
  40%  { background-position: 100% 80%; }
  60%  { background-position: 30%  100%; }
  80%  { background-position: 10%  40%; }
  100% { background-position: 0%   30%; }
}
</style>
