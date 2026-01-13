'use client';
import { useEffect } from "react";
import CompileSection from "./components/CompileSection";
import DecompileSection from "./components/DecompileSection";
import { tabs } from "./globals";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(()=>{
    const firstTabLocation = Object.values(tabs)[0];

    if (!!firstTabLocation)
    {
      router.push(firstTabLocation);
    }
  }, []);
}
