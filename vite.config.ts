import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-tasas': {
        target: 'https://svg.iot-ve.online:3003', // El puerto que dice tu manual
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-tasas/, '')
      }
     // '/usuario': {
     //   target: 'https://wsrv.iot-ve.online',
     //   changeOrigin: true,
     //   secure: false,
     // },
    //  '/cliente': {
    //    target: 'https://wsrv.iot-ve.online',
    //    changeOrigin: true,
     //   secure: false,
      //},
     // '/configuracion': {
     //   target: 'https://wsrv.iot-ve.online',
     //   changeOrigin: true,
     //   secure: false,
     // },
   //   '/cola': {
     //   target: 'https://wsrv.iot-ve.online',
     //   changeOrigin: true,
     //   secure: false,
      //},
    },
  }
  
  
})
