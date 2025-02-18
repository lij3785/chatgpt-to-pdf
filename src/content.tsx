import React from 'react';
import { createRoot } from 'react-dom/client';
import { PDFControls } from './components/PDFControls';
import { useMessages } from './hooks/useMessages';
import { usePDF } from './hooks/usePDF';

const App = () => {
  const { selectedMessages, toggleMessage, selectAll, isLoading, isSelectionMode, toggleSelectionMode } = useMessages();
  const { generatePDF, isGenerating } = usePDF();

  // 添加错误处理
  React.useEffect(() => {
    const handleError = (error: Error) => {
      if (error.message.includes('Extension context invalidated')) {
        console.log('扩展正在重新加载，请刷新页面');
        // 可选：自动刷新页面
        // window.location.reload();
      }
    };

    window.addEventListener('error', (e) => handleError(e.error));
    window.addEventListener('unhandledrejection', (e) => handleError(e.reason));

    return () => {
      window.removeEventListener('error', (e) => handleError(e.error));
      window.removeEventListener('unhandledrejection', (e) => handleError(e.reason));
    };
  }, []);

  // 检查 chrome.runtime 是否可用
  const checkRuntime = () => {
    if (!chrome.runtime || !chrome.runtime.id) {
      console.log('扩展上下文已失效，请刷新页面');
      return false;
    }
    return true;
  };

  // 添加消息选择功能
  const addMessageSelectors = () => {
    if (!checkRuntime()) return;

    const messages = document.querySelectorAll('.message:not([data-message-id])');
    messages.forEach((message, index) => {
      const messageId = `msg-${Date.now()}-${index}`;
      message.setAttribute('data-message-id', messageId);
      
      // 添加选择指示器
      const indicator = document.createElement('div');
      indicator.className = 'message-selector';
      indicator.onclick = () => {
        if (checkRuntime()) {
          toggleMessage(messageId);
        }
      };
      message.prepend(indicator);
    });
  };

  // 监听新消息
  React.useEffect(() => {
    if (!checkRuntime()) return;

    const observer = new MutationObserver((mutations) => {
      if (checkRuntime()) {
        addMessageSelectors();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      if (checkRuntime()) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <PDFControls 
      selectedCount={selectedMessages.length}
      isGenerating={isGenerating}
      onGenerate={() => {
        if (checkRuntime()) {
          generatePDF(selectedMessages);
        }
      }}
      onSelectAll={() => {
        if (checkRuntime()) {
          selectAll();
        }
      }}
      isLoading={isLoading}
      isSelectionMode={isSelectionMode}
      onToggleSelectionMode={() => {
        if (checkRuntime()) {
          toggleSelectionMode();
        }
      }}
    />
  );
};

// 创建容器并渲染
const init = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<App />);

  // 添加清理函数
  return () => {
    root.unmount();
    container.remove();
  };
};

// 初始化并处理重新加载
let cleanup: (() => void) | null = null;

const reinit = () => {
  if (cleanup) {
    cleanup();
  }
  cleanup = init();
};

reinit();

// 监听扩展重新加载
chrome.runtime.onConnect.addListener(() => {
  reinit();
});