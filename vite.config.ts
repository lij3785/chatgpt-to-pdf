import { defineConfig, LibraryFormats } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// 复制文件的插件
function copyLocalesPlugin() {
  return {
    name: 'copy-files',
    closeBundle() {
      // 确保目标目录存在
      mkdirSync('dist/_locales/en', { recursive: true });
      mkdirSync('dist/_locales/zh_CN', { recursive: true });
      mkdirSync('dist/lib', { recursive: true });

      // 复制所有需要的文件
      const filesToCopy = [
        ['public/_locales/en/messages.json', 'dist/_locales/en/messages.json'],
        ['public/_locales/zh_CN/messages.json', 'dist/_locales/zh_CN/messages.json'],
        ['public/manifest.json', 'dist/manifest.json'],
      ];

      filesToCopy.forEach(([src, dest]) => {
        if (existsSync(src)) {
          copyFileSync(src, dest);
          console.log(`已复制: ${src} -> ${dest}`);
        } else {
          console.error(`文件不存在: ${src}`);
        }
      });
    },
  };
}

// 创建构建配置
function createBuildConfig(isBackground: boolean) {
  return {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: isBackground 
        ? path.resolve(__dirname, 'src/background.ts')
        : path.resolve(__dirname, 'src/content.tsx'),
      formats: ['iife'] as LibraryFormats[],
      name: isBackground ? 'BackgroundScript' : 'ContentScript',
      fileName: () => isBackground ? 'background.js' : 'content.js',
    },
    rollupOptions: {
      external: ['html2pdf.js'],
    },
  };
}

export default defineConfig(({ mode }) => {
  const isBackground = mode === 'bg';
  
  return {
    plugins: [
      ...(isBackground ? [] : [react()]),
      copyLocalesPlugin(),
    ],
    build: createBuildConfig(isBackground),
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['html2pdf.js'],
    },
  };
});