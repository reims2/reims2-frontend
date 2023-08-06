/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Composables
import { VuetifyOptions, createVuetify } from 'vuetify'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export const vuetifyOptions: VuetifyOptions = {
  components: {
    VDataTableServer,
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  display: {
    mobileBreakpoint: 'sm',
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#00658c',
          secondary: '#924c00',
          accent: '#5d6136', // tertiary
          background: '#ffede3',
          surface: '#fffbff',
          error: '#ba1a1a',
          info: '#1a57c7',
          success: '#006d3c',
          warning: '#9e4300',
          'surface-variant': '#dbe4e6',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-accent': '#ffffff',
          'on-error': '#ffffff',
          'on-info': '#ffffff',
          'on-success': '#ffffff',
          'on-warning': '#ffffff',
          'on-background': '#191c1d',
          'on-surface': '#191c1d',
          'on-surface-variant': '#3f484a',
        },
      },
    },
    variations: {
      colors: ['primary', 'surface', 'surface-variant', 'secondary', 'accent'],
      lighten: 6,
      darken: 2,
    },
  },
}
export default createVuetify(vuetifyOptions)
