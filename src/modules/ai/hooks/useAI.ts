import { useState, useCallback } from 'react';
import { aiService } from '../services/AIService';

export function useAI() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const parseWhatsApp = useCallback(async (text: string, file?: { base64: string; mimeType: string }) => {
    try {
      setLoading(true);
      setError(null);
      return await aiService.parseWhatsAppDocument(text, file);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInsights = useCallback(async (payload: { salesData: any; inventoryData: any; showrooms: any[]; target: number }) => {
    try {
      setLoading(true);
      setError(null);
      return await aiService.getSalesInsights(payload);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    parseWhatsApp,
    getInsights
  };
}
