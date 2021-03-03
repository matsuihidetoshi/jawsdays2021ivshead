import colors from 'vuetify/es5/util/colors'
import axios from 'axios'
import CopyPlugin from 'copy-webpack-plugin'

export default {
  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    titleTemplate: '%s - JAWS DAYS 2021',
    title: 'JAWS DAYS 2021',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'JAWS DAYS 2021 セッション配信サイト' },
      { hid: 'keywords', name: 'keywords', content: 'AWS, JAWS, 配信, セッション' },
      { hid: 'og:site_name', property: 'og:site_name', content: 'JAWS DAYS 2021' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: process.env.BASE_URL || 'http://localhost:3000' },
      { hid: 'og:title', property: 'og:title', content: 'JAWS DAYS 2021' },
      { hid: 'og:description', property: 'og:description', content: 'JAWS DAYS 2021 セッション配信サイト' },
      { hid: 'og:image', property: 'og:image', content: (process.env.BASE_URL || 'http://localhost:3000') + '/icon.png' }
    ],
    link: [
      {
        rel: 'stylesheet',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/video.js/7.6.6/video-js.css'
      },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    {
      src: '~/plugins/vue-chartjs',
      ssr: false,
    }
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/google-analytics'
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content'
  ],

  googleAnalytics: {
    id: process.env.GOOGLE_ANALYTICS_ID
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Content module configuration (https://go.nuxtjs.dev/config-content)
  content: {
  },

  // Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        light: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  },

  pwa: {
    manifest: {
      name: 'JAWS DAYS 2021',
      short_name: 'JD 2021'
    }
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    extend(config: any, ctx: any) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/
        })
      }
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'node_modules/amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.*',
            to: '[name].[ext]'
          }
        ]
      })
    ]
  },

  generate: {
    async routes () {
      let streams: any[] = []
      await axios.get('https://xus4jptq21.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getStreamData').then(response => {
        streams = response.data.body
      })
      return streams.map((stream: any) => {
        return '/' + stream.slug
      })
    }
  },

  typescript: {
    typeCheck: true,
    ignoreNotFoundWarnings: true
  }
}
