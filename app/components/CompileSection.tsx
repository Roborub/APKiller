import { useEffect, useState } from "react";

export default function CompileSection() {
  const [outputDirectory, setOutputDirectory] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string>("Console Out -- changing tabs will clear output but won't stop the command.");

  useEffect(() => {
    function handleCompileLog(data: string) {
      setConsoleOutput((prev) => prev + "\n" + data);
    }

    window.electronAPI.onCompileLog(handleCompileLog);
  }, []);

  async function chooseOutputDirectory() {
    const selectedDirectory = await window.electronAPI.chooseDirectory();
    setOutputDirectory(selectedDirectory);
  }

  async function compile() {
    try {
      if (!outputDirectory) {
        return;
      }

      await window.electronAPI.compileApk(outputDirectory);
      
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <section className="select-none flex h-full rounded-lg bg-secondary">
      <div className="p-5 w-full">
        <span className="block mb-5 font-bold">COMPILE</span>
        <div className="mb-3 grid grid-cols-2 gap-5">
          <span className="col-span-1 my-auto">Decompiled Folder Location</span>
          <a onClick={chooseOutputDirectory} className="p-3 rounded-lg bg-dark text-white select-none cursor-pointer ml-3 text-center">Choose</a>
          <div className="ml-3 my-auto wrap-break-word col-span-2">{outputDirectory && outputDirectory}</div>
        </div>
        <div className="mb-3 grid">
          <a onClick={compile} className="p-3 rounded-lg bg-white/50 text-black font-bold select-none cursor-pointer text-center">Compile</a>
        </div>
        <textarea className="w-full h-50 bg-black mt-5 p-2 text-xs overflow-y-scroll" value={consoleOutput} readOnly />
      </div>
    </section>
  )
}

