'use client';

import { useEffect, useState } from "react";
import { globalTools } from "../globals";

export default function Settings() {
  const [toolLocations, setToolLocations] = useState<Record<string, string>>({});

  useEffect(() => {
    (async function() {
      if (!window.storeAPI?.get) {
        console.warn("storeAPI not yet available");
        return;
      }

      const updatedLocations: Record<string, string> = {};

      for (let tool of globalTools) {
        const toolLocation = await window.storeAPI.get(tool);

        if (!toolLocation || typeof toolLocation !== "string") {
          continue;
        }

        updatedLocations[tool] = toolLocation;
      }

      setToolLocations({ ...toolLocations, ...updatedLocations });
    })();
  }, []);

  async function setLocationOfTool(toolLocationId: string) {
    if (!toolLocationId || typeof toolLocationId !== "string") {
      return;
    }

    const locations = await window.electronAPI.chooseDirectory();
    const location = locations;
    
    if (!location)
    {
      return;
    }

    setToolLocations({ ...toolLocations, [toolLocationId]: location });

    window.storeAPI.set(toolLocationId, location);
  }

  return (
    <div className="select-none font-sans items-center justify-center gap-3 fixed top-15 right-3 left-3 bottom-3">
      <main className="h-full w-full rounded-lg bg-secondary justify-start">
        <div className="p-5 w-full">
          <h1 className="font-bold mb-3">File Locations</h1>
          {
            globalTools && globalTools.length > 0 && globalTools.map(t =>
              <div key={t} className="mb-1 grid grid-cols-6 gap-5">
                <span className="col-span-1 my-auto">{t}</span>
                <a onClick={() => { setLocationOfTool(t); }} className="p-3 rounded-lg bg-dark text-white select-none cursor-pointer ml-3 text-center col-span-2">Select Location</a>
                <span className="select-all ml-3 my-auto wrap-break-word col-span-3">{toolLocations[t] ?? ""}</span>
              </div>
            )
          }
        </div>
      </main>
    </div>
  )
}
