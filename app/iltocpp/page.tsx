"use client";
import { useEffect, useState } from "react";

export default function Il2CppDump() {
  const [soLocation, setSoLocation] = useState<string | null>(null);
  const [dataLocation, setDataLocation] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string>("Console Out -- changing tabs will clear output but won't stop the command.");

  useEffect(() => {
    function handleIl2CppDumpLog(data: string) {
      setConsoleOutput((prev) => prev + "\n" + data);
    }

    window.electronAPI.onIl2CppDumpLog(handleIl2CppDumpLog);
  }, []);

  async function chooseSoLocation() {
    const selectedDirectory = await window.electronAPI.chooseFile();
    setSoLocation(selectedDirectory);
  }

  async function chooseDataLocation() {
    const selectedDirectory = await window.electronAPI.chooseFile();
    setDataLocation(selectedDirectory);
  }

  async function dump() {
    try {
      if (!soLocation || !dataLocation) {
        return;
      }

      await window.electronAPI.il2cppdump(soLocation ?? "", dataLocation ?? "");

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="font-sans items-center justify-center gap-3 fixed top-15 right-3 left-3 bottom-3">
      <div className="h-full w-full grid gap-5 items-center sm:items-start top-15">
        <section className="select-none flex h-full rounded-lg bg-secondary">
          <div className="p-5 w-full">
            <span className="block mb-5 font-bold">Il2Cpp Dumper</span>
            <div className="mb-3 grid grid-cols-2 gap-5">
              <span className="col-span-1 my-auto">.so File Location</span>
              <a onClick={chooseSoLocation} className="p-3 rounded-lg bg-dark text-white select-none cursor-pointer ml-3 text-center">Choose</a>
              <div className="ml-3 my-auto wrap-break-word col-span-2">{soLocation && soLocation}</div>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-5">
              <span className="col-span-1 my-auto">global-metadata.dat File Location</span>
              <a onClick={chooseDataLocation} className="p-3 rounded-lg bg-dark text-white select-none cursor-pointer ml-3 text-center">Choose</a>
              <div className="ml-3 my-auto wrap-break-word col-span-2">{dataLocation && dataLocation}</div>
            </div>
            <div className="mb-3 grid">
              <a onClick={dump} className="p-3 rounded-lg bg-white/50 text-black font-bold select-none cursor-pointer text-center">Dump</a>
            </div>
            <textarea className="w-full h-50 bg-black mt-5 p-2 text-xs overflow-y-scroll" value={consoleOutput} readOnly />
          </div>
        </section>
      </div>
    </div>
  )
}

