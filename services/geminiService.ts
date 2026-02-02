
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Client, Employee, Expense, Invoice, PaymentOrder, Correspondence } from "../types";

// تهيئة Gemini باستخدام مفتاح API من متغيرات البيئة
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * تحليل ملخص تنفيذي للمشاريع
 */
export const generateExecutiveSummary = async (
  companyName: string,
  projects: Project[]
): Promise<string> => {
  if (!process.env.API_KEY) return "خدمة التحليل الذكي غير مفعلة.";
  if (projects.length === 0) return "لا توجد مشاريع نشطة لتحليلها.";

  const projectSummary = projects.map(p => `- Project: ${p.name}, Value: ${p.contractValue}, Items: ${p.items.length}`).join('\n');
  const prompt = `بصفتك مساعداً استراتيجياً لمجموعة EB، حلل المشاريع التالية وقدم ملخصاً تنفيذياً باللغة العربية يشمل التقدم والمخاطر والتوصيات:\n${projectSummary}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "لم يتم استلام رد.";
  } catch (error) {
    return "حدث خطأ أثناء التحليل.";
  }
};

/**
 * مساعد البحث الذكي مع دعم خرائط جوجل (Maps Grounding)
 */
export const queryAppAssistant = async (
  query: string,
  data: any,
  userName: string
): Promise<{ text: string; sources?: any[] }> => {
  if (!process.env.API_KEY) return { text: "API Key مفقود." };

  const systemInstruction = `أنت مساعد EB الذكي. لديك وصول لبيانات النظام. استخدم خرائط جوجل إذا طلب المستخدم مواقع أو موردين قريبين. المستخدم: ${userName}`;

  try {
    // استخدام gemini-2.5-flash لدعم Maps Grounding
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || "عذراً، لم أتمكن من العثور على إجابة.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { text, sources };
  } catch (error) {
    console.error(error);
    return { text: "حدث خطأ في معالجة طلبك." };
  }
};

/**
 * تحليل صورة هندسية أو إنشائية
 */
export const analyzeConstructionImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: `بصفتك خبيراً هندسياً، حلل هذه الصورة المتعلقة بمشروع إنشائي وأجب على: ${prompt}` }
        ]
      }
    });
    return response.text || "لم يتم العثور على تحليل.";
  } catch (error) {
    return "حدث خطأ أثناء تحليل الصورة.";
  }
};
