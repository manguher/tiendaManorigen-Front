module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    'autoprefixer': {},
    // Asegurarse de que PostCSS no procese los bloques de script en archivos .vue
    'postcss-discard-comments': {}
  }
}
