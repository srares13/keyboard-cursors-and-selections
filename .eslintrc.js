module.exports = {
   extends: ['eslint:recommended', 'plugin:prettier/recommended'],
   plugins: ['prettier'],
   parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module'
   },
   env: {
      node: true,
      es6: true
   },
   rules: {
      'prettier/prettier': [
         'error',
         {
            'endOfLine': 'auto'
         }
      ],
      indent: ['error', 3, { SwitchCase: 1 }],
      // quotes: ['error', 'single', { 'allowTemplateLiterals': true }],
      semi: ['error', 'never'],
      'no-extra-semi': 'off',
      'no-unused-vars': ['warn', { vars: 'all' }],
      'no-empty': 'warn',
      'no-undef': 'error'
   }
}
