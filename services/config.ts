
// ملف إعدادات مركزي لإدارة متغيرات البيئة والتحقق من النظام
export const config = {
  // الوصول الآمن لمتغيرات البيئة المحقونة
  apiKey: process.env.API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  
  // بيانات التطبيق
  appVersion: '4.0.0',
  appName: 'EB Group ERP',
  
  // مؤشرات الحالة
  isDbConfigured: !!process.env.DATABASE_URL,
  isAiEnabled: !!process.env.API_KEY
};

/**
 * دالة للتحقق من جاهزية النظام عند بدء التشغيل
 * تقوم بفحص وجود مفاتيح الربط مع قاعدة البيانات والذكاء الاصطناعي
 */
export const checkSystemReadiness = () => {
    console.group('🚀 EB ERP System Readiness Check');
    console.log(`App Version: ${config.appVersion}`);
    
    if (config.isDbConfigured) {
        console.log(`✅ Database: Configured (URL Detected). System ready for backend synchronization.`);
        // هنا يمكن إضافة كود تهيئة الاتصال بقاعدة البيانات مستقبلاً
    } else {
        console.log(`⚠️ Database: Not Configured. Running in LocalStorage (Offline) mode.`);
    }

    if (config.isAiEnabled) {
        console.log(`✅ AI Services: Enabled (Gemini API Key Present)`);
    } else {
        console.warn(`❌ AI Services: Disabled (Missing API Key)`);
    }
    console.groupEnd();
};
