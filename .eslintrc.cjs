/* eslint-env node */
// 解决 ESLint 在解析模块路径时可能遇到的问题，特别是当使用 TypeScript 的路径映射（path mapping）时。这个补丁确保 ESLint 能够正确解析模块
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  // 这个配置文件是项目中的根 ESLint 配置文件，ESLint 不会在父级目录中查找其他配置文件
  root: true,
  extends: [
    'plugin:vue/vue3-essential', // Vue 3 的基本规则集
    'eslint:recommended', // ESLint 推荐的规则集
    '@vue/eslint-config-typescript', // Vue 和 TypeScript 的规则集
    '@vue/eslint-config-prettier', // 集成了 Prettier 的 Vue 规则集
  ],
  // 小程序全局变量
  globals: {
    uni: true,
    wx: true,
    WechatMiniprogram: true,
    getCurrentPages: true,
    UniApp: true,
    UniHelper: true,
    Page: true,
    AnyObject: true,
    THREE: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // Prettier 的 ESLint 插件规则，用于格式化代码。这里配置了 Prettier 的选项，与之前提供的 Prettier 配置相同
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: false,
        printWidth: 100,
        trailingComma: 'all',
        endOfLine: 'auto',
      },
    ],
    // 禁用对 Vue 组件名称必须是多个单词的规则的警告
    'vue/multi-word-component-names': ['off'],
    // 禁用对在 setup 函数中解构 props 的警告
    'vue/no-setup-props-destructure': ['off'],
    // 禁用对使用已废弃的 v-is 指令的警告
    'vue/no-deprecated-html-element-is': ['off'],
    // 禁用对 TypeScript 中未使用变量的警告
    '@typescript-eslint/no-unused-vars': ['off'],
  },
}
