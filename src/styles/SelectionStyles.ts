import { createGlobalStyle } from 'styled-components';

export const SelectionStyles = createGlobalStyle`
  .selectable-message {
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;
    padding-left: 30px !important;
  }

  .selectable-message::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    border: 2px solid #10a37f;
    border-radius: 4px;
    background: white;
    transition: all 0.2s ease;
  }

  .selectable-message:hover {
    background-color: rgba(16, 163, 127, 0.05);
  }

  .selectable-message.selected::before {
    background: #10a37f;
    content: '✓';
    color: white;
    text-align: center;
    line-height: 18px;
    font-size: 12px;
  }

  .selectable-message.selected {
    background-color: rgba(16, 163, 127, 0.1);
  }
`; 