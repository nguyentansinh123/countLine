<<<<<<< HEAD
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
=======
// filepath: /e:/Projects/csit/client/frontend/eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
>>>>>>> develop

export default tseslint.config(
  { ignores: ['dist'] },
  {
<<<<<<< HEAD
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
=======
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      'plugin:prettier/recommended',
    ],
>>>>>>> develop
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
<<<<<<< HEAD
=======
      prettier: prettier,
>>>>>>> develop
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
<<<<<<< HEAD
    },
  },
)
=======
      'prettier/prettier': 'error',
    },
  }
);
>>>>>>> develop
