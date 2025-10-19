import tailwindcss from '@tailwindcss/vite'
import IconsResolver from 'unplugin-icons/resolver'
import ViteComponents from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/global.css'],

  runtimeConfig: {
    public: {
      playlistUrl: '',
      env: 'production'
    }
  },

  nitro: {
    experimental: {
      tasks: true
    }
  },
  vite: {
    plugins: [tailwindcss(),

      ViteComponents({
        resolvers: [
          IconsResolver({
            prefix: '',
            strict: true,
            alias: {
              'i': 'ph',
            },
            enabledCollections: ['ph'],
          }),
        ],
        dts: true,
      }),
      Icons({
        iconCustomizer(collection, icon, props) {
          props.width = '24px';
          props.height = '24px';
        },
        autoInstall: true,
        compiler: 'vue3',
      })
    ],
  },

  modules: ['@vueuse/nuxt', '@vite-pwa/nuxt'],

  pwa: {
    strategies: 'injectManifest',
    registerType: 'autoUpdate',
    manifest: {
      name: 'Media',
      short_name: 'HomeMedia',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'icon.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
        },
        {
          src: 'icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
        },
        {
          src: 'icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true
    },
  }
})