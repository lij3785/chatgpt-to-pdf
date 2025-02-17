import { useCallback } from 'react';

interface TranslationParams {
  count?: number;
  [key: string]: any;
}

export const useI18n = () => {
  const getMessage = useCallback((messageName: string, substitutions?: string | string[]) => {
    return chrome.i18n.getMessage(messageName, substitutions);
  }, []);

  const t = (key: string, params?: TranslationParams) => {
    if (!params) return getMessage(key);
    return getMessage(key, params.count?.toString());
  };

  return {
    t
  };
};