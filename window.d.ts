interface Window {
  storeAPI: {
    get: (key: string) => any;
    set: (key: string, value: any) => any;
  },
  electronAPI: {
    chooseDirectory: () => Promise<string>;
    chooseFile: () => Promise<string>;
    closeWindow: () => void;
    compileApk: (outputDir: string) => Promise<{ success: any; output: any; error: any; }>;
    decompileApk: (file: string) => Promise<{ success: any; output: any; error: any; }>;
    getDevices: () => Promise<string[]>;
    getApps: (deviceName: string) => Promise<string[]>;
    pullApk: (appName: string, selectedDevice: string) => Promise;
    il2cppdump: (soLocation: string, globalMetadata: string) => Promise;
    onDecompileLog: (callback: (data: string)=>void) => void;
    onCompileLog: (callback: (data: string)=>void) => void;
    onPullApkLog: (callback: (data: string)=>void) => void;
    onIl2CppDumpLog: (callback: (data: string)=>void) => void;
  }
}
