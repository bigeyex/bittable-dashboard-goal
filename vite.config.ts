import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: '0.0.0.0',
    port: 5050,
    proxy: {
      '/api': 'https://api.apiusb.com/api/app?service=App.NumbersFormula.RandomNumberGenerator&num=8&min=7&max=15'
    }
  },
})
