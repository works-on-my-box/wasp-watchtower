import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { wasp } from 'wasp/client/vite'

export default defineConfig({
  plugins: [wasp(), tailwindcss()],
  server: {
    // Don't open a browser on `wasp start`: under WSL it opens the Windows default browser.
    open: false,
  },
})
