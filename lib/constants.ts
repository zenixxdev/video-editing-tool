export const PRODUCT = { name: "LyricFlow", tagline: "Make every word move.", supportEmail: "hello@lyricflow.studio" } as const;
export const AUTH_BASE_URL = "https://ep-spring-unit-ahrywssh.neonauth.c-3.us-east-1.aws.neon.tech/neondb/auth";
export const ASPECTS = [{ id: "reel", label: "Reel / Short", ratio: "9:16", width: 1080, height: 1920 }, { id: "portrait", label: "Portrait", ratio: "4:5", width: 1080, height: 1350 }, { id: "square", label: "Square", ratio: "1:1", width: 1080, height: 1080 }] as const;
export const TEMPLATES = [
 { id:"blue-sky", title:"Blue Sky Serif", category:"Romantic", font:"serif", animation:"fade-up", color:"#f5f4ef" },
 { id:"punjabi-bold", title:"Punjabi Bold", category:"High-energy", font:"sans", animation:"scale", color:"#f5f4ef" },
 { id:"sad-minimal", title:"Sad Monochrome", category:"Minimal", font:"serif", animation:"fade", color:"#f5f4ef" },
 { id:"lofi", title:"Lo-fi Typewriter", category:"Lo-fi", font:"mono", animation:"fade-up", color:"#f5f4ef" },
 { id:"karaoke", title:"Karaoke Focus", category:"Karaoke", font:"sans", animation:"karaoke", color:"#f5f4ef" },
] as const;
