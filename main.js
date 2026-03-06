import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const iconPath = path.join(__dirname, 'public', 'M.ico');
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true, // Be cautious with this option (consider using contextIsolation)
        },
    });

    if (process.env.NODE_ENV === 'development') {
        // Development mode: Load from Vite development server
        mainWindow.loadURL('http://localhost:5173'); // Replace with your Vite development server port
    } else {
        // Production mode: Load from bundled files
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html')); // Adjust path as needed
    }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
