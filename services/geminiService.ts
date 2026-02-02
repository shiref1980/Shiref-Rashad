
import { GoogleGenAI } from "@google/genai";
import { Project, Client, Employee, Expense, Invoice, PaymentOrder, Correspondence } from "../types";
import { config } from "./config";

// تهيئة عميل Gemini باستخدام المفتاح من الإعدادات المركزية
// يتم استخدام config.apiKey الذي يقرأ من process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: config.apiKey });

export const generateExecutiveSummary = async (
  companyName: string,
  projects: Project[]
): Promise<string> => {
  // التحقق من وجود المفتاح قبل إرسال الطلب لضمان استقرار البرنامج
  if (!config.apiKey) {
    return "خدمة التحليل الذكي غير مفعلة. يرجى إضافة API_KEY في ملف .env.";
  }

  if (projects.length === 0) {
    return "لا توجد مشاريع نشطة لتحليلها حالياً.";
  }

  const projectSummary = projects.map(p => {
    const duration = Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24));
    return `- Project: ${p.name}
      Value: ${p.contractValue.toLocaleString()} SAR
      Duration: ${duration} days
      Items: ${p.items.length}
      Status: ${p.items.every(i => i.status === 'COMPLETED') ? 'Completed' : 'In Progress'}`;
  }).join('\n');

  const totalValue = projects.reduce((acc, curr) => acc + curr.contractValue, 0);

  const prompt = `
    You are a strategic executive assistant for the Board of Directors at ${companyName}.
    Your task is to generate a high-level Executive Summary (in Arabic) based on the following project portfolio data.

    **Company Data:**
    - Total Portfolio Value: ${totalValue.toLocaleString()} SAR
    - Active Projects Count: ${projects.length}
    
    **Projects Details:**
    ${projectSummary}

    **Required Output Structure (in Arabic):**
    1. **Overview & Progress (نظرة عامة والتقدم):** Summarize the overall status of the portfolio.
    2. **Potential Risks (المخاطر المحتملة):** Identify potential financial or timeline risks based on the data (e.g., short durations for high value, complexity).
    3. **Strategic Suggestions (المقترحات والتوصيات):** Provide actionable advice for the management.

    **Tone:** Professional, authoritative, and concise. Suitable for General Manager Eng. Rakan Al-Shateri.
    **Closing:** End with a respectful compliment to the founder Eng. Sherif Rashad.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "لم يتم استلام رد من النظام الذكي.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء تحليل البيانات. يرجى التحقق من صحة مفتاح API واتصال الإنترنت.";
  }
};

/**
 * AI Assistant search function
 */
export const queryAppAssistant = async (
  query: string,
  data: {
    projects: Project[],
    clients: Client[],
    employees: Employee[],
    expenses: Expense[],
    invoices: Invoice[],
    paymentOrders: PaymentOrder[],
    correspondence: Correspondence[]
  },
  userName: string
): Promise<string> => {
  if (!config.apiKey) {
    return "عذراً، المساعد الذكي يحتاج إلى تفعيل مفتاح API في إعدادات النظام للعمل.";
  }

  // Fix: changed start_date to startDate and end_date to endDate on line 81 to match Project type definition
  const context = `
    You are "EB Smart Assistant", an expert AI for EB Group (founded by Eng. Sherif Rashad). 
    User Name: ${userName}
    Current Date: ${new Date().toLocaleDateString()}
    
    Data Context (JSON Summary):
    - Projects: ${JSON.stringify(data.projects.map(p => ({ id: p.id, name: p.name, val: p.contractValue, start: p.startDate, end: p.endDate })))}
    - Clients: ${JSON.stringify(data.clients.map(c => ({ name: c.name, type: c.projectType })))}
    - Employees: ${JSON.stringify(data.employees.map(e => ({ name: e.name, role: e.role, dept: e.department })))}
    - Finances: Total Expenses: ${data.expenses.reduce((s, e) => s + e.amount, 0)}, Total Invoices: ${data.invoices.reduce((s, i) => s + i.totalAmount, 0)}
    - Correspondence: ${data.correspondence.length} records.
    
    Instructions:
    1. Answer only based on the provided data.
    2. Be professional and use Arabic as the primary language.
    3. If the user asks for a calculation (like total revenue), perform it correctly.
    4. If the data is missing, politely inform the user.
    5. Be helpful and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: context
      }
    });
    return response.text || "عذراً، لم أتمكن من العثور على إجابة.";
  } catch (error) {
    console.error("Assistant Error:", error);
    return "حدث خطأ أثناء البحث الذكي. يرجى المحاولة لاحقاً.";
  }
};
