// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxt/eslint',
  ],

  googleFonts: {
    families: {
      'Playfair+Display': [400, 700, 900],
      Inter: [300, 400, 500, 600],
    },
    display: 'swap',
  },

  runtimeConfig: {
    tmdbApiKey: process.env.TMDB_API_KEY,  // server-only
    public: {
      tmdbBaseUrl: process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3',
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
  },

  app: {
    head: {
      title: 'Mood Movie｜依心情探索電影',
      meta: [
        { name: 'description', content: '依照你的當下心情，探索最適合的電影推薦。8 種情緒入口，讓你找到今晚最想看的電影。' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
})
