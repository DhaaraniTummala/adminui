import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import {resolve} from 'node:path'

console.log(__dirname);

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
  }
})
