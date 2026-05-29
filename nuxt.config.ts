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

  nitro: {
    preset: 'vercel',
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
      title: 'Kino｜依情境探索電影',
      meta: [
        { name: 'description', content: '選一個此刻的情境，找到今晚最適合你的電影。6 種情境入口，讓選片變得直覺。' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
})
