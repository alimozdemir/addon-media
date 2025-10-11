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

  modules: ['@vueuse/nuxt'],
})