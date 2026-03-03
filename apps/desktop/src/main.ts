import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV !== 'production';
app.setName("Zottis");

const WEB_URL = isDev
  ? 'http://localhost:3000'
  : process.env.APP_WEB_URL ?? 'http://localhost:3000';

// assets/ sits next to both src/ (dev) and dist/ (prod) — same relative path works for both
const ICON_FILE =
  process.platform === 'darwin' ? 'icon.icns' :
  process.platform === 'win32'  ? 'icon.ico'  :
                                  'icon.png';
const ICON_PATH = path.join(__dirname, '../assets', ICON_FILE);
const appIcon = nativeImage.createFromPath(ICON_PATH);

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 800,
    icon: appIcon,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // Preload is only used in production (built artifact)
      ...(!isDev && { preload: path.join(__dirname, 'preload.js') }),
    },
  });

  win.webContents.on("did-finish-load", () => {
    win.webContents.setZoomFactor(0.9);
  });

  win.loadURL(WEB_URL);

  // In dev, Next.js may still be starting — retry on failure
  if (isDev) {
    win.webContents.on('did-fail-load', () => {
      console.log(`[desktop] Could not reach ${WEB_URL}, retrying in 2s…`);
      setTimeout(() => win.loadURL(WEB_URL), 2000);
    });
  }
}

app.whenReady().then(() => {
  // macOS dock icon
  if (process.platform === 'darwin' && !appIcon.isEmpty()) {
    app.dock.setIcon(appIcon);
  }

  createWindow();

  // macOS: re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
