'use client';

import { FaX } from "react-icons/fa6";
import { tabs } from "../globals"
import Tab from "./Tab"
import { useEffect, useState } from "react";

export default function TopBar() {
  const [activeTabId, setActiveTabId] = useState("");

  useEffect(() => {
    setActiveTabId(Object.keys(tabs)[0]);
  }, []);

  function closeWindow() {
    window.electronAPI.closeWindow();
  }

  return (
    <nav className="topbar w-full bg-dark select-none flex items-center justify-start px-6 shadow-black/10 shadow-xl fixed top-0 z-50">
      <span className="text-lg font-semibold mr-20">APKiller</span>
      {
        tabs && Object.keys(tabs).map((t, i) => {
          return <Tab onClick={() => { setActiveTabId(t) }} active={t === activeTabId} key={t} tabName={t} tabHref={tabs[t]} zIndex={i} />
        })
      }
      <a onClick={closeWindow} className="no-drag hover:shadow-black/20 hover:shadow-md hover:bg-black text-white hover:text-white top-2 right-2 text-2xl font-extralight fixed h-8 w-8 text-center flex flex-col bg-dark cursor-pointer">
        <FaX className="m-auto text-lg" />
      </a>
    </nav>
  )
}
