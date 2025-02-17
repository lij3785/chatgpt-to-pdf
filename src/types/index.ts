export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }
  
  export interface PDFOptions {
    theme: 'light' | 'dark';
    fontSize: number;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  }
  
  export interface ThemeColors {
    type: "light" | "dark";
    background: string;
    text: string;
    border: string;
    primary: string;
    secondary: string;
  }