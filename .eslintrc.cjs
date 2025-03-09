/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-typescript'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off',
    'vue/valid-v-slot': ['error', { allowModifiers: true }],
    'vue/no-undef-components': ['error', {
      ignorePatterns: ['v-[A-Za-z]+-[A-Za-z]+', 'v-[A-Za-z]+'] // 忽略所有 Vuetify 組件
    }],
    // 'vue/no-unused-components': 'error', // 未使用的組件報錯
    // 'vue/no-undef-components': 'error',  // 未定義的組件報錯
    // 'no-undef': 'error',                 // 未定義的變量報錯
    // 'no-unused-vars': 'error',           // 未使用的變量報錯
    // '@typescript-eslint/no-unused-vars': ['error'], // TypeScript 未使用的變量報錯
  },
};
