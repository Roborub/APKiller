import Link from "next/link";
import { MouseEventHandler } from "react";

export default function Tab({ tabName, tabHref, zIndex, active, onClick } : { tabName: string, tabHref: string, zIndex: number, active: boolean, onClick : MouseEventHandler }) {
  const bgColor = active ? "bg-light" : "bg-dark";
  return <Link onClick={onClick} href={tabHref} className={`${bgColor} no-drag tab-shape p-3 w-50 text-center mr-[-15] z-[${ zIndex }]`}>{tabName}</Link>
}
