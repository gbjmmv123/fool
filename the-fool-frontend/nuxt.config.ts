export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  srcDir: 'app/',
  ssr: false,
  devtools: { enabled: true },
  modules: ['@unocss/nuxt'],
  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },
  css: ['~/styles/vars.css', '~/styles/global.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080',
    },
  },
  app: {
    head: {
      title: '愚者教会',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content' },
        { name: 'description', content: '愚者教会前端项目骨架。' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IM+Fell+English&family=Noto+Serif+SC:wght@400;500;700&display=swap',
        },
      ],
    },
  },
  typescript: {
    strict: true,
  },
  imports: {
    dirs: ['composables'],
    presets: [
      {
        from: '@vueuse/core',
        imports: ['useEventListener', 'useMediaQuery', 'useLocalStorage', 'useWindowSize'],
      },
    ],
  },
  vite: {
    optimizeDeps: {
      exclude: ['#app-manifest'],
    },
  },
})
