import React, { useState } from 'react';
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

const ControlsContainer = styled.div`
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
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
  margin-left: 6px;
`;

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

  return (
    <ControlsContainer>
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        {t('saveAsPDF')}
        {selectedCount > 0 && <Badge>{selectedCount}</Badge>}
      </DropdownButton>

      <DropdownContent isOpen={isOpen}>
        <MenuItem onClick={handleSaveAll}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          {t('saveAllAsPDF')}
        </MenuItem>
        
        <MenuItem 
          onClick={handleEnterSelectionMode}
          className={isSelectionMode ? 'active' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          {t('selectToSave')}
          {selectedCount > 0 && <Badge>{selectedCount}</Badge>}
        </MenuItem>

        {isSelectionMode && selectedCount > 0 && (
          <MenuItem 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            {isGenerating ? t('generating') : t('saveSelectedAsPDF')}
          </MenuItem>
        )}
      </DropdownContent>
    </ControlsContainer>
  );
};