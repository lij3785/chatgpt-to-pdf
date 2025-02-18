import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);  // 添加加载状态
  const [isSelectionMode, setIsSelectionMode] = useState(false);  // 添加选择模式状态

  // 初始化消息列表
  const initMessages = useCallback(() => {
    const elements = document.querySelectorAll('[data-message-id]');
    if (elements.length > 0) {
      setIsLoading(false);
      const chatMessages = Array.from(elements)
        .map(element => {
          const messageId = element.getAttribute('data-message-id');
          if (!messageId) return null;

          const contentElement = element.querySelector('.markdown.prose') || 
                               element.querySelector('.text-base') ||
                               element;
          
          const isAssistant = element.closest('[data-message-author-role="assistant"]') !== null;
          
          return {
            id: messageId,
            role: isAssistant ? 'assistant' : 'user',
            content: contentElement.textContent || '',
            timestamp: Date.now(),
          } as Message;
        })
        .filter((msg): msg is Message => msg !== null);
      
      setMessages(chatMessages);
      return chatMessages;
    }
    return [];
  }, []);

  // 添加初始化和消息监听
  useEffect(() => {
    // 立即执行一次初始化
    initMessages();

    // 监听页面消息变化
    const observer = new MutationObserver(() => {
      initMessages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [initMessages]);

  // 选择所有消息
  const selectAll = useCallback(() => {
    // 先初始化消息列表
    const currentMessages = initMessages();
    
    if (currentMessages.length === 0) {
      console.log('正在重新扫描消息...');
      // 强制重新扫描 DOM
      const elements = document.querySelectorAll('[data-message-id]');
      const messageIds = Array.from(elements)
        .map(element => element.getAttribute('data-message-id'))
        .filter((id): id is string => id !== null);
      
      if (messageIds.length > 0) {
        console.log(`找到 ${messageIds.length} 条消息`);
        setSelectedMessages(messageIds);
      } else {
        console.warn('未找到任何消息');
      }
    } else {
      console.log(`选择 ${currentMessages.length} 条消息`);
      setSelectedMessages(currentMessages.map(msg => msg.id));
    }
  }, [initMessages]);

  // 切换消息选择状态
  const toggleMessage = useCallback((messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMessages([]);
  }, []);

  // 切换选择模式
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    if (!isSelectionMode) {
      // 进入选择模式时重新初始化消息列表
      initMessages();
    } else {
      setSelectedMessages([]); // 退出选择模式时清空选择
    }
  }, [isSelectionMode, initMessages]);

  // 优化选择模式的事件处理
  useEffect(() => {
    if (!isSelectionMode) {
      // 清理选择器样式和事件
      document.querySelectorAll('.selectable-message').forEach(message => {
        message.classList.remove('selectable-message', 'selected');
      });
      return;
    }

    // 使用事件委托，将事件监听器添加到父元素
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const message = target.closest('[data-message-id]');
      if (!message) return;

      const messageId = message.getAttribute('data-message-id');
      if (!messageId) return;

      toggleMessage(messageId);
      message.classList.toggle('selected');
    };

    // 添加样式
    document.querySelectorAll('[data-message-id]').forEach(message => {
      message.classList.add('selectable-message');
      if (selectedMessages.includes(message.getAttribute('data-message-id') || '')) {
        message.classList.add('selected');
      }
    });

    // 使用事件委托
    document.body.addEventListener('click', handleClick);

    return () => {
      document.body.removeEventListener('click', handleClick);
    };
  }, [isSelectionMode, selectedMessages]);

  // 优化 MutationObserver
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const observer = new MutationObserver(() => {
      // 使用防抖，避免频繁更新
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const elements = document.querySelectorAll('[data-message-id]');
        if (elements.length > 0) {
          setIsLoading(false);
          const chatMessages = Array.from(elements)
            .map(element => {
              const messageId = element.getAttribute('data-message-id');
              if (!messageId) return null;

              // 获取消息内容元素
              const contentElement = element.querySelector('.markdown.prose') || 
                                   element.querySelector('.text-base') ||
                                   element;

              // 向上查找包含角色信息的元素
              const messageContainer = element.closest('[data-message-author-role]');
              const authorRole = messageContainer?.getAttribute('data-message-author-role');

              console.log('消息元素属性:', {
                id: messageId,
                authorRole,
                elementAuthorRole: element.getAttribute('data-message-author-role'),
                containerAuthorRole: messageContainer?.getAttribute('data-message-author-role'),
                classList: Array.from(element.classList),
                containerClassList: messageContainer ? Array.from(messageContainer.classList) : [],
              });

              // 确保角色值为 "assistant" 或 "user"
              const role = authorRole === 'assistant' ? 'assistant' : 'user';
              console.log('角色判断:', {
                authorRole,
                role,
                elementType: element.tagName,
                containerType: messageContainer?.tagName,
              });
              
              const content = contentElement.textContent || '';

              console.log('找到消息:', {
                id: messageId,
                authorRole,
                role,
                contentPreview: content.slice(0, 50)
              });

              return {
                id: messageId,
                role,
                content,
                timestamp: Date.now(),
              } as Message;
            })
            .filter((msg): msg is Message => msg !== null);
          
          setMessages(chatMessages);
        }
      }, 200);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    messages,
    selectedMessages,
    toggleMessage,
    selectAll,
    clearSelection,
    isLoading,  // 导出加载状态
    isSelectionMode,
    toggleSelectionMode,
  };
};