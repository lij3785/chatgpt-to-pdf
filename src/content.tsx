import React from 'react';
import { createRoot } from 'react-dom/client';
import { PDFControls } from './components/PDFControls';
import { useMessages } from './hooks/useMessages';
import { usePDF } from './hooks/usePDF';

const App = () => {
  const { selectedMessages, toggleMessage, selectAll, isLoading, isSelectionMode, toggleSelectionMode } = useMessages();
  const { generatePDF, isGenerating } = usePDF();

  // 添加消息选择功能
  const addMessageSelectors = () => {
    const messages = document.querySelectorAll('.message:not([data-message-id])');
    messages.forEach((message, index) => {
      const messageId = `msg-${Date.now()}-${index}`;
      message.setAttribute('data-message-id', messageId);
      
      // 添加选择指示器
      const indicator = document.createElement('div');
      indicator.className = 'message-selector';
      indicator.onclick = () => toggleMessage(messageId);
      message.prepend(indicator);
    });
  };

  // 监听新消息
  React.useEffect(() => {
    const observer = new MutationObserver(addMessageSelectors);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <PDFControls 
      selectedCount={selectedMessages.length}
      isGenerating={isGenerating}
      onGenerate={() => generatePDF(selectedMessages)}
      onSelectAll={selectAll}
      isLoading={isLoading}
      isSelectionMode={isSelectionMode}
      onToggleSelectionMode={toggleSelectionMode}
    />
  );
};

// 创建容器并渲染
const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);