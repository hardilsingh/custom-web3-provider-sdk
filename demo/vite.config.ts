import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['custom-web3-provider-sdk']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
