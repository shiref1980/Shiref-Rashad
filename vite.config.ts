
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // تحميل متغيرات البيئة من ملفات .env إذا وجدت
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // ضبط المسار الأساسي للجذر
    base: '/',
    define: {
      // حقن مفتاح API ومتغيرات قاعدة البيانات بشكل آمن
      // سيتم استبدال هذه القيم أثناء البناء بما هو موجود في إعدادات Netlify
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
      'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL || process.env.DATABASE_URL || ''),
    },
    server: {
      host: '0.0.0.0', 
      port: 5173,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false, 
      rollupOptions: {
        // استبعاد مكتبات Electron من نسخة الويب
        external: ['electron', 'path', 'fs', 'url'],
      }
    }
  }
})
