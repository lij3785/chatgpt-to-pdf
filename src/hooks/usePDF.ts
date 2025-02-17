import { useState } from 'react';
import { Message } from '../types';
import { PDFService } from '../services/pdfService';

const defaultOptions = {
  theme: 'light' as const,
  fontSize: 12,
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
};

export const usePDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfService = new PDFService(defaultOptions);

  const generatePDF = async (selectedMessageIds: string[], retryCount = 0) => {
    if (isGenerating) {
      console.log('PDF 正在生成中，请等待...');
      return;
    }

    if (selectedMessageIds.length === 0) {
      console.warn('没有选择任何消息');
      return;
    }

    if (retryCount >= 3) {
      const errorMsg = '重试次数过多，导出失败';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('开始生成 PDF...', {
        selectedCount: selectedMessageIds.length,
        retryCount,
      });

      // 确保 DOM 已完全加载
      await new Promise(resolve => setTimeout(resolve, 500));

      // 验证所有消息元素
      const missingMessages = selectedMessageIds.filter(id => {
        const element = document.querySelector(`[data-message-id="${id}"]`);
        if (!element) {
          console.warn(`未找到消息元素: ${id}`);
          return true;
        }
        return false;
      });

      if (missingMessages.length > 0) {
        console.log(`等待消息加载... (重试 ${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return generatePDF(selectedMessageIds, retryCount + 1);
      }

      const pdfBlob = await pdfService.generatePDF(selectedMessageIds);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `chatgpt-conversation-${timestamp}.pdf`;

      await chrome.runtime.sendMessage({
        type: 'download_pdf',
        url: URL.createObjectURL(pdfBlob),
        filename,
      });

      console.log('PDF 生成成功!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '生成 PDF 时发生错误';
      console.error('PDF 生成失败:', error);
      setError(errorMsg);

      if (retryCount < 2) {
        console.log(`尝试重新生成... (重试 ${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return generatePDF(selectedMessageIds, retryCount + 1);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    isGenerating,
    error,
  };
};