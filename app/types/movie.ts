export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
}

export interface MovieDetail extends Movie {
  runtime: number | null
  tagline: string
  genres: Genre[]
  production_countries: { name: string }[]
  status: string
}

export interface Genre {
  id: number
  name: string
}

export interface TMDBResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export type MoodKey =
  | 'friday_night'
  | 'date_night'
  | 'family_time'
  | 'need_a_cry'
  | 'feel_good'
  | 'epic_adventure'

export interface MoodConfig {
  label: string
  emoji: string
  genres: number[]
  keywords?: number[]
  listId?: number
  voteAvgMin?: number
  voteCountMax?: number
  runtimeMax?: number
  color: string
  glowColor?: string
  gradient: string
  description: string
}
