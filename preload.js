const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  chooseFile: () => ipcRenderer.invoke("dialog:chooseFile"),
  chooseDirectory: () => ipcRenderer.invoke("dialog:chooseDirectory"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  compileApk: (outputDir) => ipcRenderer.invoke("compileApk", outputDir),
  decompileApk: (file) => ipcRenderer.invoke("decompileApk", file),
  getDevices: () => ipcRenderer.invoke("getDevices"),
  getApps: (deviceName) => ipcRenderer.invoke("getApps", deviceName),
  pullApk: (appName, selectedDevice) => ipcRenderer.invoke("pullApk", appName, selectedDevice),
  il2cppdump: (soLocation, globalMetadata) => ipcRenderer.invoke("il2cppdump", soLocation, globalMetadata),
  onDecompileLog: (callback) => { ipcRenderer.on("onDecompileLog", (_event, data) => callback(data)) },
  onCompileLog: (callback) => { ipcRenderer.on("onCompileLog", (_event, data) => callback(data)) },
  onPullApkLog: (callback) => { ipcRenderer.on("onPullApkLog", (_event, data) => callback(data)) },
  onIl2CppDumpLog: (callback) => { ipcRenderer.on("onIl2CppDumpLog", (_event, data) => callback(data)) }
});

contextBridge.exposeInMainWorld("storeAPI", {
  get: (key) => ipcRenderer.invoke("store:get", key),
  set: (key, value) => ipcRenderer.invoke("store:set", key, value)
}
);
