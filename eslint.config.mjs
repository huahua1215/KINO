import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom ESLint rules
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  }
)
