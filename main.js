const { app, BrowserWindow, ipcMain, clipboard, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d0d0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false
  });

  mainWindow.loadFile('src/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());

ipcMain.handle('copy-to-clipboard', (event, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('export-palette', (event, data) => {
  const { palette, format } = data;
  let content = '';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `palette-${timestamp}`;

  if (format === 'css') {
    content = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`).join('\n')}\n}`;
  } else if (format === 'json') {
    content = JSON.stringify(palette.map(c => ({
      name: c.name,
      hex: c.hex,
      rgb: c.rgb,
      hsl: c.hsl
    })), null, 2);
  } else if (format === 'scss') {
    content = palette.map((c, i) => `$color-${i + 1}: ${c.hex}; // ${c.name}`).join('\n');
  } else if (format === 'txt') {
    content = palette.map(c => `${c.name}\nHEX: ${c.hex}\nRGB: ${c.rgb}\nHSL: ${c.hsl}\n`).join('\n---\n\n');
  }

  const dir = app.getPath('downloads');
  const ext = format;
  const fullPath = path.join(dir, `${filename}.${ext}`);

  try {
    fs.writeFileSync(fullPath, content, 'utf8');
    shell.showItemInFolder(fullPath);
    return { success: true, path: fullPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
