import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    title: "مجموعة حدود الإعمار (EB Group)",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Simplified for this example
      zoomFactor: 0.70
    },
    autoHideMenuBar: true
  });

  // Load the built React app
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  
  // Open DevTools (optional, for debugging)
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});