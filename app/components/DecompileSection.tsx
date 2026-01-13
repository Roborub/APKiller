import { useEffect, useState } from "react";

export default function DecompileSection() {
  const [file, setFiles] = useState<string>();
  const [consoleOutput, setConsoleOutput] = useState<string>("Console Out -- changing tabs will clear output but won't stop the command.");

  useEffect(() => {
    function handleDecompileLog(data: string) {
      setConsoleOutput((prev) => prev + "\n" + data);
    }

    window.electronAPI.onDecompileLog(handleDecompileLog);
  }, []);

  async function chooseFiles() {
    const selectedFiles = await window.electronAPI.chooseFile();

    if (!selectedFiles) {
      return null;
    }

    setFiles(selectedFiles);
  }

  async function decompile() {
    if (!file) {
      return;
    }

    await window.electronAPI.decompileApk(file);
  }

  return (
    <section className="flex h-full rounded-lg bg-secondary select-none">
      <div className="p-5 w-full">
        <span className="block mb-5 font-bold">DECOMPILE</span>
        <div className="mb-3 grid grid-cols-2 gap-5">
          <span className="col-span-1 my-auto">File to decompile</span>
          <a onClick={chooseFiles} className="p-3 rounded-lg bg-dark text-white select-none cursor-pointer ml-3 text-center">Choose</a>
          <span className="ml-3 my-auto wrap-break-word col-span-2">{file && file}</span>
        </div>
        <div className="mb-3 grid">
          <a onClick={decompile} className="p-3 rounded-lg bg-white/50 text-black font-bold select-none cursor-pointer text-center">Decompile</a>
        </div>
        <textarea className="w-full h-50 bg-black mt-5 p-2 text-xs overflow-y-scroll" value={consoleOutput} readOnly />
      </div>
    </section>
  )
}
