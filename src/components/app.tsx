import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { MessageSelector } from './MessageSelector';
import { PDFControls } from './PDFControls';
import { ThemeToggle } from './ThemeToggle';
import { useMessages } from '../hooks/useMessages';
import { usePDF } from '../hooks/usePDF';
import { useTheme } from '../hooks/useTheme';
import { GlobalStyle } from '../styles/GlobalStyle';
import { SelectionStyles } from '../styles/SelectionStyles';

const AppContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 300px;
  background: ${props => props.theme.background};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
`;

export const App: React.FC = () => {
  const { messages, selectedMessages, toggleMessage, selectAll, isLoading, isSelectionMode, toggleSelectionMode } = useMessages();
  const { generatePDF, isGenerating } = usePDF();
  const { theme, toggleTheme } = useTheme();

  const handleGeneratePDF = async () => {
    await generatePDF(selectedMessages);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SelectionStyles />
      <AppContainer>
        <ThemeToggle theme={theme.type} onToggle={toggleTheme} />
        <MessageSelector 
          messages={messages}
          selectedIds={new Set(selectedMessages)}
          onToggle={toggleMessage}
        />
        <PDFControls 
          selectedCount={selectedMessages.length}
          isGenerating={isGenerating}
          onGenerate={handleGeneratePDF}
          onSelectAll={selectAll}
          isLoading={isLoading}
          isSelectionMode={isSelectionMode}
          onToggleSelectionMode={toggleSelectionMode}
        />
      </AppContainer>
    </ThemeProvider>
  );
};