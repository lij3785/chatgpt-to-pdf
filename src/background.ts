// 使用立即执行函数
(function() {
  // 监听扩展安装
  chrome.runtime.onInstalled.addListener(() => {
    console.log('扩展已安装');
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'download_pdf') {
      chrome.downloads.download({
        url: message.url,
        filename: message.filename,
        saveAs: true,
      }, (downloadId) => {
        sendResponse({ success: true, downloadId });
      });
      return true; // 保持消息通道开启以支持异步响应
    }
  });
})();

// 确保 background script 不会被终止
export {};