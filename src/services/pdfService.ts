// @ts-ignore
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import { Message } from '../types';

interface PDFOptions {
  theme: 'light' | 'dark';
  fontSize: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export class PDFService {
  private options: PDFOptions;

  constructor(options: PDFOptions) {
    this.options = options;
  }

  async generatePDF(messageIds: string[]): Promise<Blob> {
    try {
      console.log('开始 PDF 生成流程...');

      // 创建容器并设置样式
      const container = document.createElement('div');
      container.style.cssText = `
        width: 180mm;  // 减小宽度以适应边距
        margin: 0 auto;
        padding: 0;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-sizing: border-box;
      `;

      // 收集所有消息
      for (const messageId of messageIds) {
        const element = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!element) continue;

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
          margin-bottom: 15px;
          padding: 12px;
          border-radius: 8px;
          background: white;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          width: 100%;
          font-size: 14px;
          line-height: 1.5;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        `;

        const content = element.querySelector('.markdown.prose')?.innerHTML || 
                       element.querySelector('.text-base')?.innerHTML || 
                       element.innerHTML;
        
        messageDiv.innerHTML = content;

        // 调整代码块样式
        messageDiv.querySelectorAll('pre').forEach(pre => {
          pre.style.cssText = `
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-x: hidden;
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            background: #f6f8fa;
            border-radius: 6px;
            font-size: 12px;
            line-height: 1.4;
          `;
        });

        container.appendChild(messageDiv);
      }

      document.body.appendChild(container);

      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const options = {
          margin: [15, 15, 15, 15],  // 上右下左边距
          filename: 'chatgpt-conversation.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            width: container.offsetWidth,  // 确保捕获完整宽度
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true,
          }
        };

        const pdf = await html2pdf().set(options).from(container).outputPdf('blob');
        console.log('PDF 生成成功');
        return pdf;

      } finally {
        document.body.removeChild(container);
      }

    } catch (error) {
      console.error('PDF 生成失败:', error);
      throw error;
    }
  }
}