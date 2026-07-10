// Configuración de ESLint: revisa el código en busca de errores y malas prácticas de React/JS antes de que lleguen a producción
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([ // Configuración de ESLint para el proyecto
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'], // Archivos a revisar: todos los archivos JS y JSX
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])