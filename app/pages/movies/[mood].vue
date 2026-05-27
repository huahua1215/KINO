<script setup lang="ts">
import { MOOD_MAP } from '~/utils/moodMap'
import type { MoodKey, Movie, MovieDetail } from '~/types/movie'
import { useAnimations } from '~/composables/useAnimations'

const route = useRoute()
const mood = computed(() => route.params.mood as MoodKey)
const moodConfig = computed(() => MOOD_MAP[mood.value])

// Redirect if invalid mood
if (!MOOD_MAP[mood.value]) {
  throw createError({ statusCode: 404, statusMessage: '找不到此情緒頁面' })
}

useSeoMeta({
  title: () => `${moodConfig.value?.label ?? ''} 心情電影 | Kino`,
  description: () => `探索適合「${moodConfig.value?.label ?? ''}」心情的電影推薦`,
})

const { animateCardsIn } = useAnimations()
const dismissLoading = inject<() => void>('dismissLoading')

// Fetch movies via server API proxy
const {
  data: movies,
  status,
  error,
  refresh,
} = await useAsyncData<Movie[]>(
  () => `movies-${mood.value}`,
  () => {
    const config = moodConfig.value
    if (config.listId) {
      return $fetch<{ items: Movie[] }>('/api/tmdb', {
        params: { endpoint: `list/${config.listId}`, page: 1 },
        retry: 3,
        retryDelay: 600,
      }).then((r) => r.items ?? [])
    }
    const params: Record<string, string | number> = {
      endpoint: 'discover/movie',
      with_genres: config.genres.join('|'),
      sort_by: 'popularity.desc',
      'vote_count.gte': 100,
      page: 1,
    }
    if (config.keywords?.length) {
      params.with_keywords = config.keywords.join('|')
    }
    if (config.voteAvgMin !== undefined) {
      params['vote_average.gte'] = config.voteAvgMin
    }
    if (config.voteCountMax !== undefined) {
      params['vote_count.lte'] = config.voteCountMax
    }
    if (config.runtimeMax !== undefined) {
      params['with_runtime.lte'] = config.runtimeMax
    }
    return $fetch<{ results: Movie[] }>('/api/tmdb', { params, retry: 3, retryDelay: 600 }).then((r) => r.results)
  },
  { watch: [mood] }
)

const isLoading = computed(() => status.value === 'pending')

onMounted(() => {
  if (!isLoading.value) {
    nextTick(() => {
      if (movies.value?.length) animateCardsIn('.movie-card')
      dismissLoading?.()
    })
  }
})

watch(isLoading, (loading) => {
  if (!loading) {
    nextTick(() => {
      if (movies.value?.length) animateCardsIn('.movie-card')
      dismissLoading?.()
    })
  }
})

// Modal state
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
    console.warn('[Modal] Failed to load movie detail')
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
    <!-- Mood-colored ambient background -->
    <div
      class="fixed inset-0 pointer-events-none transition-all duration-1000 -z-0"
      :style="`background: radial-gradient(ellipse 80% 50% at 50% -10%, ${moodConfig.color}15 0%, transparent 70%)`"
    />

    <!-- Header -->
    <div class="relative z-10 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Back link -->
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors duration-200 mb-6"
        >
          ← 返回選擇心情
        </NuxtLink>

        <!-- Mood Title -->
        <div class="flex items-center gap-4 mb-2">
          <span :style="{ color: moodConfig.color }">
            <MoodIcon :mood="mood" :size="52" />
          </span>
          <div>
            <h1
              class="font-display font-black text-3xl sm:text-4xl text-white"
              :style="`color: ${moodConfig.color}`"
            >
              {{ moodConfig.label }}
            </h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <main class="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
      <div class="max-w-7xl mx-auto">
        <!-- Error state -->
        <div v-if="error" class="flex flex-col items-center justify-center py-20 text-center">
          <span class="text-5xl mb-4">😵</span>
          <p class="text-white/60 mb-4">無法載入電影資料，請稍後再試。</p>
          <button
            class="btn-primary glass text-white border border-white/20"
            @click="refresh()"
          >
            🔄 重試
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-else-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div v-for="i in 10" :key="i" class="rounded-xl overflow-hidden bg-cinema-800">
            <div class="skeleton aspect-[2/3]" />
            <div class="p-3 space-y-2">
              <div class="skeleton h-4 w-3/4 rounded" />
              <div class="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        </div>

        <!-- Movie grid -->
        <div
          v-else-if="movies?.length"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <MovieCard
            v-for="movie in movies"
            :key="movie.id"
            :movie="movie"
            @click="openModal(movie)"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <span class="text-5xl mb-4">🎭</span>
          <p class="text-white/60">這個情緒暫時沒有找到電影。</p>
        </div>
      </div>
    </main>

    <!-- Movie Modal -->
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
