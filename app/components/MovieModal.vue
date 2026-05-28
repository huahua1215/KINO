<script setup lang="ts">
import type { Movie, MovieDetail } from '~/types/movie'
import { useFavoritesStore } from '~/stores/favorites'
import { useAnimations } from '~/composables/useAnimations'
import { TMDB_IMAGE_BASE, TMDB_IMAGE_ORIGINAL } from '~/composables/useTMDB'

const props = defineProps<{
  movie: Movie | null
  detail: MovieDetail | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const favStore = useFavoritesStore()
const { animateModalOpen, animateModalClose } = useAnimations()

const overlayRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

const isFav = computed(() =>
  props.movie ? favStore.isFavorited(props.movie.id) : false
)

const posterUrl = computed(() =>
  props.detail?.backdrop_path
    ? `${TMDB_IMAGE_ORIGINAL}${props.detail.backdrop_path}`
    : props.movie?.poster_path
      ? `${TMDB_IMAGE_BASE}${props.movie.poster_path}`
      : '/moods/placeholder.svg'
)

const displayMovie = computed(() => props.detail ?? props.movie)

const rating = computed(() =>
  displayMovie.value?.vote_average
    ? displayMovie.value.vote_average.toFixed(1)
    : 'N/A'
)

const year = computed(() =>
  displayMovie.value?.release_date
    ? displayMovie.value.release_date.slice(0, 4)
    : '—'
)

onMounted(() => {
  animateModalOpen(overlayRef.value, panelRef.value)
})

function close() {
  animateModalClose(overlayRef.value, panelRef.value, () => {
    emit('close')
  })
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === overlayRef.value) close()
}

// ESC key
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <div
    ref="overlayRef"
    class="modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    style="display: flex"
    @click="handleOverlayClick"
  >
    <div
      ref="panelRef"
      class="modal-panel relative w-full sm:max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl bg-cinema-800 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
    >
      <!-- Close button -->
      <button
        class="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200 text-white"
        aria-label="關閉"
        @click="close"
      >
        ✕
      </button>

      <!-- Backdrop / Poster hero -->
      <div class="relative w-full aspect-[2/1] sm:aspect-video overflow-hidden rounded-t-2xl bg-cinema-900">
        <img
          v-if="displayMovie"
          :src="posterUrl"
          :alt="displayMovie.title"
          class="w-full h-full object-cover"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-cinema-800 via-cinema-800/40 to-transparent" />

        <!-- Favorite button on hero -->
        <button
          v-if="movie"
          class="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full glass
                 text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
          :class="isFav ? 'text-red-400 bg-red-500/20 border-red-400/30 border' : 'text-white border-white/20 border'"
          @click="favStore.toggleFavorite(movie!)"
        >
          <span>{{ isFav ? '❤️' : '🤍' }}</span>
          <span>{{ isFav ? '已收藏' : '加入收藏' }}</span>
        </button>
      </div>

      <!-- Content -->
      <div class="p-5 sm:p-6">
        <!-- Loading state -->
        <template v-if="isLoading">
          <div class="space-y-3">
            <div class="skeleton h-8 w-3/4 rounded-lg" />
            <div class="skeleton h-4 w-1/3 rounded" />
            <div class="skeleton h-20 w-full rounded-lg" />
          </div>
        </template>

        <template v-else-if="displayMovie">
          <!-- Title + Meta -->
          <div class="mb-4">
            <h2 class="font-display font-bold text-xl sm:text-2xl text-white leading-tight mb-2">
              {{ displayMovie.title }}
            </h2>
            <div class="flex flex-wrap items-center gap-3 text-sm text-white/50">
              <span class="flex items-center gap-1 text-yellow-400 font-semibold">
                ⭐ {{ rating }}
              </span>
              <span>{{ year }}</span>
              <span v-if="detail?.runtime && detail.runtime > 0">
                🕐 {{ Math.floor(detail.runtime / 60) }}h {{ detail.runtime % 60 }}m
              </span>
              <span
                v-if="detail?.status"
                class="px-2 py-0.5 rounded-full text-xs bg-white/10"
              >
                {{ detail.status }}
              </span>
            </div>
          </div>

          <!-- Tagline -->
          <p
            v-if="detail?.tagline"
            class="text-white/50 italic text-sm mb-4 border-l-2 border-yellow-400/50 pl-3"
          >
            "{{ detail.tagline }}"
          </p>

          <!-- Overview -->
          <div class="mb-4">
            <h3 class="text-xs text-white/40 font-medium tracking-widest uppercase mb-2">劇情簡介</h3>
            <p class="text-white/80 text-sm leading-relaxed">
              {{ displayMovie.overview || '暫無中文簡介。' }}
            </p>
          </div>

          <!-- Genres -->
          <div v-if="detail?.genres?.length" class="flex flex-wrap gap-2">
            <span
              v-for="genre in detail.genres"
              :key="genre.id"
              class="px-3 py-1 rounded-full text-xs glass text-white/70"
            >
              {{ genre.name }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
