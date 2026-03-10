const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  exportPalette: (data) => ipcRenderer.invoke('export-palette', data),
});
