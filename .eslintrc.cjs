module.exports = {
   extends: 'eslint:recommended',
   parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module'
   },
   env: {
      node: true,
      es6: true
   },
   rules: {
      indent: ['error', 3],
      // quotes: ['error', 'single', { 'allowTemplateLiterals': true }],
      semi: ['error', 'never'],
      'no-unused-vars': ['warn', { vars: 'all' }],
      'no-empty': 'warn',
      'no-undef': 'error'
   }
}
