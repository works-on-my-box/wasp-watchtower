import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { wasp } from 'wasp/client/vite'

export default defineConfig({
  plugins: [wasp(), tailwindcss()],
  server: {
    // Не открывать браузер при `wasp start`: из WSL это открывает личный Chrome основателя.
    open: false,
  },
})
