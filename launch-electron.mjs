import { createRequire } from "node:module"
import { fileURLToPath } from 'url';

import { compileApk, decompileApk, getDevices, getApps, pullApk, il2cppdump } from './electronlib/services/apkService.js';

import http from 'http';

import path from "path";
import store from './lib/store.js';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { app, dialog, ipcMain } = require('electron');
const { MicaBrowserWindow } = require("mica-electron");

const PORT = 3000;
const TIMEOUT = 20000;

ipcMain.handle("dialog:chooseFile", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "APK Files", extensions: ["apk"] }, { name: "JKS File", extensions: ["jks"] }, { name: "All Files", extensions: ["*"] }] });
  return result.filePaths[0];
});

ipcMain.handle("dialog:chooseDirectory", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  return result.filePaths[0];
});


ipcMain.handle("store:get", (_event, key) => store.get(key));
ipcMain.handle("store:set", (_event, key, value) => store.set(key, value));

function createWindow() {

  const win = new MicaBrowserWindow({
    width: 1024,
    height: 650,
    minWidth: 650,
    minHeight: 400,
    frame: false,
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMicaEffect();
  win.setDarkTheme();

  ipcMain.handle("window:close", () => {
    if (win) {
      win.close();
    }
  });

  ipcMain.handle('compileApk', async (_event, outputDir) => {
    try {
      win.webContents.send("onCompileLog", "Starting compile");

      await compileApk(outputDir, (data) => {
        win.webContents.send("onCompileLog", data);
      });

      win.webContents.send("onCompileLog", "Compile complete");
    } catch (err) {
      win.webContents.send("onCompileLog", err.message);
    }
  });

  ipcMain.handle("decompileApk", async (_event, fileName) => {
    try {
      win.webContents.send("onDecompileLog", "Starting decompile");

      await decompileApk(fileName, (data) => {
        win.webContents.send("onDecompileLog", data);
      });

      win.webContents.send("onDecompileLog", "Decompile complete");
    } catch (err) {
      win.webContents.send("onDecompileLog", err.message);
    }
  });

  ipcMain.handle("getDevices", async (_event) => {
    try {
      return await getDevices();
    } catch (err) {
      console.error(err);
      return [];
    }
  });

  ipcMain.handle("getApps", async (_event, deviceName) => {
    try {
      return await getApps(deviceName);
    } catch (err) {
      console.error(err);
      return [];
    }
  });

  ipcMain.handle("pullApk", async (_event, appName, selectedDevice) => {
    try {
      return await pullApk(appName, selectedDevice, (data) => {
        win.webContents.send("onPullApkLog", data);
      });
    } catch (err) {
      return { error: err };
    }
  });

  ipcMain.handle("il2cppdump", async (_event, soLocation, globalMetadata) => {
    try {
      return await il2cppdump(soLocation, globalMetadata, (data) => {
        win.webContents.send("onIl2CppDumpLog", data);
      });
    } catch (err) {
      return { error: err };
    }
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(async () => {
  try {
    await waitForFrontend(3000);
    createWindow();
  } catch (err) {
    console.error("Error:", err.message);
    dialog.showErrorBox("Frontend Load Failed", "Could not connect to frontend. Is it running?");
  }
});

function waitForFrontend() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const attempt = () => {
      const req = http.get(`http://localhost:${PORT}`, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          retry();
        }
      });

      req.on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startTime >= TIMEOUT) {
        reject(new Error("Frontend failed to start in time."));
      } else {
        setTimeout(attempt, 500);
      }
    };

    attempt();
  });
}

