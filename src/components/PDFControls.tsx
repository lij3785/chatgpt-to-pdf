import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import styled from 'styled-components';

interface PDFControlsProps {
  selectedCount: number;
  isGenerating: boolean;
  onGenerate: () => void;
  onSelectAll: () => void;
  isLoading: boolean;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
}

const ControlsContainer = styled.div<{ left: number }>`
  position: fixed;
  top: 8px;
  left: ${props => props.left}px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button`
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  transition: background-color 0.1s ease;
  user-select: none;
  min-width: 32px;
  justify-content: center;

  &:hover {
    background: #f9fafb;
  }

  &:active {
    background: #f3f4f6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 1.5;
    color: #4b5563;
  }

  span {
    color: #111827;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 20px;
  }
`;

const DropdownButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  gap: 8px;
  white-space: nowrap;
  min-width: max-content;
`;

const MenuItem = styled.button`
  padding: 8px 12px;
  border: none;
  background: none;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  &:hover {
    background: #f8f9fa;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.primary {
    color: #10a37f;
    font-weight: 500;
  }

  &:not(:last-child) {
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    padding-right: 12px;
    margin-right: 4px;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Badge = styled.span`
  background: #10a37f;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  min-width: 20px;
  text-align: center;
`;

const Overlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(52, 53, 65, 0.5);
  z-index: 999;
  display: ${props => props.isVisible ? 'block' : 'none'};
  animation: fadeIn 0.15s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  width: 448px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.15s ease-out;

  @keyframes slideIn {
    from {
      transform: translate(-50%, -48%);
      opacity: 0;
    }
    to {
      transform: translate(-50%, -50%);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #6b7280;
  
  &:hover {
    color: #111827;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const ModalOption = styled.button`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #111827;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #f9fafb;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #10a37f;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(52, 53, 65, 0.7);
  z-index: 1001;
  display: ${props => props.isVisible ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const LoadingContent = styled.div`
  background: white;
  padding: 24px 32px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(8px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const LoadingText = styled.div`
  color: #111827;
  font-size: 14px;
  font-weight: 500;
`;

const PDFIcon = () => (
  <svg 
    width="20"
    height="20"
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 3v4a1 1 0 001 1h4" />
    <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
    <text
      x="8.5"
      y="16"
      fontSize="7"
      fontWeight="bold"
      fill="currentColor"
      stroke="none"
    >
      PDF
    </text>
  </svg>
);

export const PDFControls: React.FC<PDFControlsProps> = ({
  selectedCount,
  isGenerating,
  onGenerate,
  onSelectAll,
  isLoading,
  isSelectionMode,
  onToggleSelectionMode,
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 更新位置
  const updatePosition = () => {
    const shareButton = document.querySelector(`[data-testid="share-chat-button"]`);
    if (shareButton) {
      const rect = shareButton.getBoundingClientRect();
      // 设置位置在 Share 按钮左侧，留出一定间距
      setPosition(rect.left - 180);
    }
  };

  // 监听 DOM 变化和窗口大小变化
  useEffect(() => {
    updatePosition();

    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    window.addEventListener('resize', updatePosition);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  const handleSaveAll = () => {
    onSelectAll();
    onGenerate();
    setIsOpen(false);
  };

  const handleEnterSelectionMode = () => {
    onToggleSelectionMode();
    setIsOpen(false);
  };

  const handleGenerate = () => {
    if (isLoading) {
      console.log('消息还在加载中，请稍候...');
      return;
    }
    onGenerate();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ControlsContainer ref={containerRef} left={position}>
        <Button onClick={() => setIsOpen(true)}>
          <PDFIcon />
          <span>Export as PDF</span>
          {selectedCount > 0 && <Badge>{selectedCount}</Badge>}
        </Button>
      </ControlsContainer>

      <Overlay isVisible={isOpen} onClick={handleClose} />
      
      <Modal isOpen={isOpen}>
        <ModalHeader>
          <ModalTitle>{t('exportOptions')}</ModalTitle>
          <CloseButton onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <ModalContent>
          <ModalOption onClick={() => {
            onSelectAll();
            onGenerate();
            setIsOpen(false);
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            {t('saveAllAsPDF')}
          </ModalOption>

          <ModalOption onClick={() => {
            onToggleSelectionMode();
            setIsOpen(false);
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            {t('selectToSave')}
            {selectedCount > 0 && <Badge>{selectedCount}</Badge>}
          </ModalOption>

          {isSelectionMode && selectedCount > 0 && (
            <ModalOption 
              onClick={() => {
                onGenerate();
                setIsOpen(false);
              }}
              disabled={isGenerating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              {isGenerating ? t('generating') : t('saveSelectedAsPDF')}
            </ModalOption>
          )}
        </ModalContent>
      </Modal>

      <LoadingOverlay isVisible={isGenerating}>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>{t('generating')}</LoadingText>
        </LoadingContent>
      </LoadingOverlay>
    </>
  );
};