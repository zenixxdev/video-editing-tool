import type { Metadata,Viewport } from "next";
import { Geist,Geist_Mono,Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
const geist=Geist({subsets:["latin"],variable:"--font-geist"});
const mono=Geist_Mono({subsets:["latin"],variable:"--font-geist-mono"});
const news=Newsreader({subsets:["latin"],variable:"--font-newsreader"});
export const metadata:Metadata={title:{default:"LyricFlow — Animated lyric videos, made simple",template:"%s | LyricFlow"},description:"Create polished animated lyrical Reels, Shorts, and TikToks with synced typography and cinematic footage."};
export const viewport:Viewport={themeColor:"#090b0d",colorScheme:"dark",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`bg-background ${geist.variable} ${mono.variable} ${news.variable}`}><body className="font-sans"><a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>{children}<Toaster theme="dark"/></body></html>}
