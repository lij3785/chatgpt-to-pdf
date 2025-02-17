import React from 'react';
import styled from 'styled-components';
import { Message } from '../types';

const MessageContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin: 10px 0;
`;

const MessageItem = styled.div<{ selected: boolean }>`
  padding: 12px;
  margin: 8px 0;
  border-radius: 6px;
  cursor: pointer;
  background: ${props => props.selected ? props.theme.primary + '20' : 'transparent'};
  border: 1px solid ${props => props.selected ? props.theme.primary : props.theme.border};
  
  &:hover {
    background: ${props => props.theme.primary + '10'};
  }
`;

interface Props {
  messages: Message[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export const MessageSelector: React.FC<Props> = ({
  messages,
  selectedIds,
  onToggle,
}) => {
  return (
    <MessageContainer>
      {messages.map(message => (
        <MessageItem
          key={message.id}
          selected={selectedIds.has(message.id)}
          onClick={() => onToggle(message.id)}
        >
          <div>{message.role}</div>
          <div>{message.content}</div>
        </MessageItem>
      ))}
    </MessageContainer>
  );
};