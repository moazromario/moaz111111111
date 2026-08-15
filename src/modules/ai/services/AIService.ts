import { AIMessage, AIAnalysisRequest, AIAnalysisResponse } from '../types';

export class AIService {
  async parseWhatsAppDocument(text: string, file?: { base64: string; mimeType: string }): Promise<any> {
    try {
      const response = await fetch('/api/whatsapp/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, file }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'فشلت عملية تحليل المستند بواسطة الذكاء الاصطناعي.');
      }

      return await response.json();
    } catch (err: any) {
      throw new Error(err.message || 'حدث خطأ غير متوقع أثناء الاتصال بالذكاء الاصطناعي.');
    }
  }

  async getSalesInsights(payload: { salesData: any; inventoryData: any; showrooms: any[]; target: number }): Promise<any> {
    try {
      const response = await fetch('/api/sales/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'فشل جلب التحليلات الذكية.');
      }

      return await response.json();
    } catch (err: any) {
      throw new Error(err.message || 'حدث خطأ في الاتصال بخدمة التحليلات الذكية.');
    }
  }
}

export const aiService = new AIService();
