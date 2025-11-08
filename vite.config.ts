import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.REPO_NAME || '251108_ParametricTower'

// https://vite.dev/config/
export default defineConfig({
  base: repoName ? `/${repoName}/` : './',
  plugins: [react()],
})
