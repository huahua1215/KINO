import type { TMDBResponse, MovieDetail } from '~/types/movie'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  const { endpoint, ...params } = query

  if (!endpoint || typeof endpoint !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing endpoint parameter' })
  }

  const searchParams = new URLSearchParams({
    api_key: config.tmdbApiKey as string,
    language: 'zh-TW',
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  })

  const url = `${config.public.tmdbBaseUrl}/${decodeURIComponent(endpoint)}?${searchParams.toString()}`

  try {
    const data = await $fetch<TMDBResponse | MovieDetail>(url)
    return data
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'TMDB API request failed' })
  }
})
