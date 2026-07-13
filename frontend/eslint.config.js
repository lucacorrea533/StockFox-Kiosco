// Configuración de ESLint: revisa el código en busca de errores y malas prácticas de React/JS antes 
// de que lleguen a producción

// ESLint es una herramienta que analiza el código fuente para encontrar errores, inconsistencias y malas 
// prácticas. Ayuda a mantener un código limpio y consistente, y a prevenir errores antes de que lleguen 
// a producción. En este proyecto, se utiliza ESLint con configuraciones específicas para React y Vite, 
// asegurando que el código cumpla con las mejores prácticas de desarrollo web moderno.

// Importes de módulos necesarios para la configuración de ESLint
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