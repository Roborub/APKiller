import { spawn, exec } from "child_process";
import store from "../../lib/store.js";
import path from "path";
import fs from "fs";

/* 
 * YOU CAN USE KEY PROVIDED OR GENERATE A NEW ONE USING:
 * keytool -genkey -v \
  -keystore my-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias my-key-alias
 * */

const KEY_ALIAS = "my-key-alias"
const KEY_PASSWORD = "password";

export function decompileApk(file, onData) {
  return new Promise(async (resolve, reject) => {
    try {
      const apktoolLocation = `${store.get("apktool")}\\apktool.bat`;
      const inputFileName = path.basename(file, ".apk");
      const outputDir = path.join(store.get("ApkillerDataLocation"), "APK_DATA", "OUT", `\\${inputFileName}`);

      const args = ["d", file, "-o", outputDir, "-f"];

      onData?.(`Spawning command:\n${apktoolLocation} ${args.join(" ")}`);

      const apktool = spawn(apktoolLocation, args, {
        windowsHide: true,
        shell: true
      });

      await hookUpLogging(apktool, apktoolLocation, onData);
    } catch (err) {
      onData?.(`!! [exception] ${err.message}`);
      reject(err);
    }
  });
}


export function compileApk(outputDir, onData) {
  return new Promise(async (resolve, reject) => {
    try {
      const outputPath = outputDir;
      const outputDirName = path.basename(outputDir);

      const rebuiltFileName = path.join(store.get("ApkillerDataLocation"), "APK_DATA", "REBUILT", `${outputDirName}.apk`);

      const apktoolLocation = `${store.get("apktool")}\\apktool.bat`;
      const args = ["b", outputPath, "-o", rebuiltFileName, "-f"];

      const fileDirectory = path.dirname(rebuiltFileName);
      const fileExtension = path.extname(rebuiltFileName);
      const fileNameNoExtension = path.basename(rebuiltFileName, fileExtension);

      const signedFileName = path.join(fileDirectory, `${fileNameNoExtension}--signed_final${fileExtension}`);
      const alignedFileName = path.join(fileDirectory, `${fileNameNoExtension}--aligned${fileExtension}`);

      const apktool = spawn(apktoolLocation, args, {
        windowsHide: true,
        shell: true
      });

      await hookUpLogging(apktool, apktoolLocation, onData);
      await alignApk(rebuiltFileName, alignedFileName, onData);
      await signApk(alignedFileName, signedFileName, onData);

      return resolve();
    } catch (err) {
      onData?.(`!! [exception] ${err.message}`);
      return reject(err);
    }
  });
}

export function alignApk(rebuiltFileName, alignedApkName, onData) {
  return new Promise(async (resolve, reject) => {
    try {
      onData?.("Aligning APK...");
      const zipalignToolLocation = `${store.get("zipalign")}\\zipalign.exe`;
      const args = ["-v", 4, rebuiltFileName, alignedApkName];

      const apkaligner = spawn(zipalignToolLocation, args, {
        windowsHide: true,
        shell: true
      });

      await hookUpLogging(apkaligner, "ApkAligner", onData);

      resolve();
    } catch (err) {
      onData?.(`!! [exception] ${err.message}`);
      reject(err);
    }
  });
}


export function il2cppdump(soLocation, globalMetadata, onData) {
  return new Promise(async (resolve, reject) => {
    try {
      onData?.("Dumping data using il2CppDumper.exe");
      onData?.(`.SO Location: ${soLocation}`);
      onData?.(`global-metadata.dat Location: ${globalMetadata}`);

      const outputDirName = path.basename(soLocation);
      const il2cppOutputFolder = path.join(
        store.get("ApkillerDataLocation"),
        "IL2CPP_DATA",
        "OUT",
        outputDirName
      );

      const il2cppdumperLocation = `${store.get("Il2CppDumper")}\\il2cppdumper.exe`;
      const ghidraScriptLocation = `${store.get("Il2CppDumper")}\\ghidra_with_struct.py`;
      const scriptJsonPath = path.join(il2cppOutputFolder, "script.json");

      const args = [soLocation, globalMetadata, il2cppOutputFolder];

      onData?.(`IL2CppDumper Location: ${il2cppdumperLocation}`);
      onData?.(`il2cpp output folder: ${il2cppOutputFolder}`);

      fs.mkdirSync(il2cppOutputFolder, { recursive: true });

      const il2cppdumper = spawn(il2cppdumperLocation, args, {
        windowsHide: true,
        shell: true
      });

      il2cppdumper.on("exit", (code) => {
        if (code === 0 || code === 3762504530) {
          onData?.(`Il2cppdumper completed with non-blocking exit code ${code}.`);
          resolve();
        } else {
          const error = `Il2cppdumper exited with code ${code}`;
          onData?.(`!![error] ${error}`);
          reject(new Error(error));
        }
      });

      await hookUpLogging(il2cppdumper, "Il2CppDumper", onData);

      // Run Ghidra integration script
      onData?.("Running Ghidra integration script...");

      const ghidraScript = spawn("python", [ghidraScriptLocation, scriptJsonPath], {
        windowsHide: true,
        shell: true
      });

      await hookUpLogging(ghidraScript, "GhidraScript", onData);

      resolve();
    } catch (err) {
      onData?.(`!! [exception] ${err.message}`);
      reject(err);
    }
  });
}


export async function getDevices() {
  return new Promise(async (resolve, reject) => {
    const adbToolLocation = `${store.get("adb")}\\adb.exe`;

    exec(`${adbToolLocation} devices`, (err, stdout) => {
      const stdoutLines = stdout.split("\n");
      const allButFirstLine = stdoutLines.slice(1);
      const devices = allButFirstLine.filter(l => l.includes("device"));
      const devicesTrimmed = devices.map(d => d.replace("device", "").replace(/[\n\t]/g, "").trim());

      if (!!devicesTrimmed && devicesTrimmed.length > 0) {
        resolve(devicesTrimmed);
      } else {
        reject();
      }
    });
  });
}


export async function pullApk(apkName, selectedDevice, onData) {
  return new Promise((resolve, reject) => {
    const adbToolLocation = `${store.get("adb")}\\adb.exe`;
    const outputFolder = path.join(store.get("ApkillerDataLocation"), "APK_DATA", "PULLED", apkName);

    // Ensure the output folder exists
    fs.mkdirSync(outputFolder, { recursive: true });

    onData?.(`[Pull Apk] Starting to pull '${apkName}' into folder '${outputFolder}'`);

    exec(`${adbToolLocation} -s ${selectedDevice} shell pm path ${apkName}`, async (err, stdout) => {
      if (err) {
        const errorMsg = `Failed to get APK paths: ${err.message}`;
        console.error(errorMsg);
        return reject(errorMsg);
      }

      const apkPaths = stdout
        .trim()
        .split('\n')
        .map(line => line.trim().match(/package:(.+\.apk)/)?.[1])
        .filter(Boolean);

      if (apkPaths.length === 0) {
        const errorMsg = "No APK paths found";
        console.error(errorMsg);
        return reject(errorMsg);
      }

      onData?.(`[Pull Apk] Found ${apkPaths.length} APK file(s)`);

      const pulledFiles = [];

      for (const apkPath of apkPaths) {
        const fileName = path.basename(apkPath);
        const outputPath = path.join(outputFolder, fileName);

        onData?.(`[Pull Apk] Pulling '${apkPath}' to '${outputPath}'`);

        try {
          await new Promise((res, rej) => {
            exec(`${adbToolLocation} -s ${selectedDevice} pull ${apkPath} "${outputPath}"`, (pullErr) => {
              if (pullErr) {
                const pullErrorMsg = `Failed to pull '${apkPath}': ${pullErr.message}`;
                console.error(pullErrorMsg);
                return rej(pullErrorMsg);
              }
              onData?.(`[Pull Apk] Pulled '${apkPath}' successfully`);
              pulledFiles.push(outputPath);
              res();
            });
          });
        } catch (pullError) {
          return reject(pullError);
        }
      }

      resolve(pulledFiles);
    });
  });
}


export async function getApps(deviceName) {
  return new Promise(async (resolve, reject) => {
    const adbToolLocation = `${store.get("adb")}\\adb.exe`;

    exec(`${adbToolLocation} -s ${deviceName} shell pm list packages --user 0 -3`, (err, stdout) => {
      const appLines = stdout.split("\n");
      const appNames = appLines.map(l => l.replace("package:", "").trim());

      if (!!appNames && appNames.length > 0) {
        resolve(appNames);
      } else {
        reject();
      }
    });
  });
}

async function signApk(alignedApkPath, signedFileName, onData) {
  return new Promise(async (resolve, reject) => {
    try {
      onData?.("Signing APK...");
      const apksignerToolLocation = `${store.get("apksigner")}\\apksigner.bat`;
      const keyFile = path.join(store.get("ApkillerDataLocation"), "my-release-key.jks");

      const args = [
        "sign",
        "--ks", keyFile,
        "--ks-key-alias", KEY_ALIAS,
        "--out", signedFileName,
        "--ks-pass", `pass:${KEY_PASSWORD}`,
        "--key-pass", `pass:${KEY_PASSWORD}`,
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "true",
        alignedApkPath
      ];

      const apksigner = spawn(apksignerToolLocation, args, {
        windowsHide: true,
        shell: true
      });

      await hookUpLogging(apksigner, "ApkSigner", onData);

      resolve();
    } catch (err) {
      onData?.(`!![exception] ${err.message}`);
      reject(err);
    }
  });
}

async function hookUpLogging(tool, toolName, onData) {
  return new Promise((resolve, reject) => {
    tool.stdout.on("data", (data) => {
      onData?.(`[stdout] ${data.toString()}`);
    });

    tool.stderr.on("data", (data) => {
      onData?.(`!![stderr] ${data.toString()}`);
    });

    tool.on("exit", (code) => {
      if (code === 0) {
        onData?.(`${toolName} completed successfully.`);
        resolve();
      } else {
        const error = `compileApk exited with code ${code} `;
        onData?.(`!![error] ${error} `);
        reject(new Error(error));
      }
    });

    tool.on("error", (err) => {
      onData?.(`!![spawn error] ${err.message} `);
      reject(err);
    });
  });
}


