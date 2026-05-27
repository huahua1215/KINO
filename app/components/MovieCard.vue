<script setup lang="ts">
import type { Movie } from '~/types/movie'
import { useFavoritesStore } from '~/stores/favorites'
import { TMDB_IMAGE_BASE } from '~/composables/useTMDB'

const props = defineProps<{
  movie: Movie
}>()

const emit = defineEmits<{
  click: [movie: Movie]
}>()

const favStore = useFavoritesStore()
const isFav = computed(() => favStore.isFavorited(props.movie.id))

function toggleFav(e: Event) {
  e.stopPropagation()
  favStore.toggleFavorite(props.movie)
}

const posterUrl = computed(() =>
  props.movie.poster_path
    ? `${TMDB_IMAGE_BASE}${props.movie.poster_path}`
    : '/moods/placeholder.svg'
)

const rating = computed(() =>
  props.movie.vote_average ? props.movie.vote_average.toFixed(1) : 'N/A'
)

const year = computed(() =>
  props.movie.release_date ? props.movie.release_date.slice(0, 4) : '—'
)
</script>

<template>
  <article
    class="movie-card group relative rounded-xl overflow-hidden cursor-pointer card-hover bg-cinema-800 border border-white/5 shadow-card"
    @click="emit('click', movie)"
  >
    <!-- Poster -->
    <div class="relative aspect-[2/3] overflow-hidden bg-cinema-700">
      <img
        :src="posterUrl"
        :alt="movie.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      >

      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <!-- Hover content -->
      <div class="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <p class="text-xs text-white/80 line-clamp-3 leading-relaxed mb-2">
          {{ movie.overview || '暫無簡介' }}
        </p>
      </div>

      <!-- Favorite button -->
      <button
        class="absolute top-2 right-2 w-8 h-8 rounded-full glass flex items-center justify-center
               opacity-0 group-hover:opacity-100 transition-all duration-300
               hover:scale-110 active:scale-95 z-10"
        :class="isFav ? 'text-red-400 bg-red-500/20 border-red-400/30' : 'text-white/70'"
        :aria-label="isFav ? '取消收藏' : '加入收藏'"
        @click="toggleFav"
      >
        <span class="text-base leading-none">{{ isFav ? '❤️' : '🤍' }}</span>
      </button>

      <!-- Rating badge -->
      <div class="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full glass text-xs font-medium text-yellow-400">
        <span>⭐</span>
        <span>{{ rating }}</span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-3">
      <h3 class="font-display font-semibold text-sm text-white line-clamp-2 leading-snug mb-1">
        {{ movie.title }}
      </h3>
      <p class="text-xs text-white/40">{{ year }}</p>
    </div>
  </article>
</template>
