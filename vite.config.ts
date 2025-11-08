import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = '251108_ParametricTower'
const base = process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/'

export default defineConfig({
  base,
  plugins: [react()],
})
