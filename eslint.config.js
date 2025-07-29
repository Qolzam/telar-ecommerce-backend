import js from '@eslint/js';
import airbnbBase from 'eslint-config-airbnb-base';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginNode from 'eslint-plugin-node';
import eslintPluginSecurity from 'eslint-plugin-security';
import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly'
      }
    },
    plugins: {
      import: eslintPluginImport,
      node: eslintPluginNode,
      security: eslintPluginSecurity,
      promise: eslintPluginPromise,
      prettier: eslintPluginPrettier
    },
    rules: {
      // Extend Airbnb base rules
      ...airbnbBase.rules,

      // Prettier integration
      'prettier/prettier': 'error',

      // Code style and formatting (handled by Prettier)
      indent: 'off', // Handled by Prettier
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'comma-dangle': 'off', // Handled by Prettier
      'no-trailing-spaces': 'off', // Handled by Prettier
      'eol-last': 'off', // Handled by Prettier
      'max-len': 'off', // Handled by Prettier

      // Variables and scope
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',

      // Functions
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'off', // Handled by Prettier
      'no-duplicate-imports': 'error',

      // Objects and arrays
      'object-curly-spacing': 'off', // Handled by Prettier
      'array-bracket-spacing': 'off', // Handled by Prettier
      'object-shorthand': 'error',

      // Node.js specific
      'node/no-unpublished-require': 'off',
      'node/no-missing-require': 'error',
      'node/no-deprecated-api': 'error',

      // Security
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-non-literal-require': 'warn',
      'security/detect-object-injection': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-unsafe-regex': 'error',

      // Promises
      'promise/always-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-native': 'off',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',
      'promise/avoid-new': 'warn',

      // Import/Export
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always'
        }
      ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',

      // Best practices
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-assign': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-concat': 'error',
      'prefer-template': 'error',
      radix: 'error',
      yoda: 'error',

      // Error prevention
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      'no-undef': 'error',
      'no-redeclare': 'error',
      'no-shadow': 'error',
      'no-use-before-define': ['error', { functions: false }],

      // Express.js specific adjustments
      'consistent-return': 'off', // Express middleware doesn't always return
      'no-param-reassign': ['error', { props: false }] // Allow modifying req/res objects
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/test/**/*.js'],
    rules: {
      'no-console': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'import/no-extraneous-dependencies': 'off'
    }
  }
];
