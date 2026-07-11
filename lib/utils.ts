import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatTime(value: number) { const m=Math.floor(value/60); const s=Math.floor(value%60); const ms=Math.floor((value%1)*10); return `${m}:${String(s).padStart(2,"0")}.${ms}`; }
