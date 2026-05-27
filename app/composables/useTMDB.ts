import type { Movie, MovieDetail, TMDBResponse } from '~/types/movie'

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
export const TMDB_IMAGE_ORIGINAL = 'https://image.tmdb.org/t/p/original'

export function useTMDB() {
  function getPosterUrl(posterPath: string | null, size: 'w500' | 'original' = 'w500'): string {
    if (!posterPath) return '/moods/placeholder.svg'
    const base = size === 'original' ? TMDB_IMAGE_ORIGINAL : TMDB_IMAGE_BASE
    return `${base}${posterPath}`
  }

  async function fetchMoviesByGenres(genres: number[], keywords: number[] = [], page = 1): Promise<Movie[]> {
    const params: Record<string, string | number> = {
      endpoint: 'discover/movie',
      with_genres: genres.join('|'),
      sort_by: 'popularity.desc',
      page,
      'vote_count.gte': 100,
    }

    if (keywords.length > 0) {
      params.with_keywords = keywords.join('|')
    }

    const cacheKey = `movies-g${genres.join('-')}-k${keywords.join('-')}-p${page}`
    const { data, error } = await useAsyncData(
      cacheKey,
      () => $fetch<TMDBResponse>('/api/tmdb', { params })
    )

    if (error.value) {
      throw error.value
    }

    return data.value?.results ?? []
  }

  async function fetchMovieDetails(id: number): Promise<MovieDetail | null> {
    const { data, error } = await useAsyncData(
      `movie-detail-${id}`,
      () => $fetch<MovieDetail>('/api/tmdb', {
        params: {
          endpoint: `movie/${id}`,
        },
      })
    )

    if (error.value) {
      throw error.value
    }

    return data.value ?? null
  }

  async function searchMovies(query: string, page = 1): Promise<Movie[]> {
    const { data, error } = await useAsyncData(
      `search-${query}-page-${page}`,
      () => $fetch<TMDBResponse>('/api/tmdb', {
        params: {
          endpoint: 'search/movie',
          query,
          page,
        },
      })
    )

    if (error.value) {
      throw error.value
    }

    return data.value?.results ?? []
  }

  async function fetchMoviesByList(listId: number, page = 1): Promise<Movie[]> {
    const { data, error } = await useAsyncData(
      `movies-list-${listId}-page-${page}`,
      () => $fetch<{ items: Movie[] }>('/api/tmdb', {
        params: { endpoint: `list/${listId}`, page },
      })
    )
    if (error.value) throw error.value
    return data.value?.items ?? []
  }

  return {
    getPosterUrl,
    fetchMoviesByGenres,
    fetchMoviesByList,
    fetchMovieDetails,
    searchMovies,
  }
}
