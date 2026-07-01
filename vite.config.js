import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this as a project site under /restaurant-demo/, but
  // Vercel serves it from the domain root — Vercel sets VERCEL=1 during its
  // build, so detect that to pick the right base path.
  base: process.env.VERCEL ? '/' : '/restaurant-demo/',
})
