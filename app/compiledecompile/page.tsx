'use client';

import CompileSection from "../components/CompileSection";
import DecompileSection from "../components/DecompileSection";

export default function CompileDecompilePage() {
  return (
    <div className="font-sans items-center justify-center gap-3 fixed top-15 right-3 left-3 bottom-3">
      <main className="h-full w-full grid grid-cols-2 gap-5 items-center sm:items-start top-15">
        <DecompileSection />
        <CompileSection />
      </main>
    </div>
  )
}

