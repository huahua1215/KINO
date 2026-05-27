import { defineStore } from 'pinia'
import type { Movie } from '~/types/movie'

const STORAGE_KEY = 'kino-favorites'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    items: [] as Movie[],
  }),

  getters: {
    count: (state) => state.items.length,
    isFavorited: (state) => (movieId: number) =>
      state.items.some((m) => m.id === movieId),
  },

  actions: {
    addFavorite(movie: Movie) {
      if (!this.isFavorited(movie.id)) {
        this.items.push(movie)
        this.saveToStorage()
      }
    },

    removeFavorite(movieId: number) {
      this.items = this.items.filter((m) => m.id !== movieId)
      this.saveToStorage()
    },

    toggleFavorite(movie: Movie) {
      if (this.isFavorited(movie.id)) {
        this.removeFavorite(movie.id)
      } else {
        this.addFavorite(movie)
      }
    },

    loadFromStorage() {
      // Must be called in onMounted or with import.meta.client guard
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          this.items = JSON.parse(raw) as Movie[]
        }
      } catch {
        console.warn('[Favorites] Failed to load from localStorage')
      }
    },

    saveToStorage() {
      if (!import.meta.client) return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
      } catch {
        console.warn('[Favorites] Failed to save to localStorage')
      }
    },

    clearAll() {
      this.items = []
      this.saveToStorage()
    },
  },
})
