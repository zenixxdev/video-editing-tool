# LyricFlow implementation checklist

Updated: July 11, 2026

## Reliability and authentication
- [x] Preserve existing Neon project and user data
- [x] Add the exact v0 preview URL to Neon Auth trusted origins
- [x] Keep strict, same-origin auth proxy requests
- [x] Use secure `lax` session cookies for reliable top-level navigation
- [x] Validate required auth configuration with actionable errors
- [x] Improve sign-in and sign-up loading, password visibility, and friendly errors
- [x] Protect dashboard, templates, account, editor, uploads, and exports
- [x] Keep every project query scoped to the authenticated user

## Product foundation
- [x] Private Neon-backed projects and revision-safe autosave
- [x] Private Blob media uploads and authenticated media delivery
- [x] Durable private MP4 export jobs
- [x] Project creation with 9:16, 4:5, and 1:1 formats
- [x] Duplicate projects without modifying the source
- [x] Archive projects without destructive deletion
- [x] Continue-editing dashboard card and project action menus

## Editor MVP
- [x] Centered vertical preview with social safe zone
- [x] Persistent top actions and export
- [x] Compact bottom editing tool dock
- [x] Contextual bottom settings panel
- [x] Timed lyric creation, editing, deletion, and clip splitting
- [x] Private audio and video replacement uploads
- [x] Typography, color, shadow, position, scale, and opacity controls
- [x] Motion presets
- [x] Position, scale, and opacity keyframes
- [x] Layer selection, visibility, lock, and mute controls
- [x] Multitrack video, lyric, and audio timeline
- [x] Scrubbing, timeline zoom, keyboard play/pause, and fine seeking
- [x] Undo and redo history
- [x] Instagram Reels, YouTube Shorts, and Snapchat Spotlight safe zones
- [x] Responsive desktop and mobile workspace

## Product presentation
- [x] Premium cinematic landing hero
- [x] Original TSX/SVG editor and template visuals
- [x] Animated hero entrance with reduced-motion support
- [x] Platform support branding
- [x] Cleaner workflow, feature, template, and CTA sections
- [x] Premium dashboard with clear hierarchy and empty state
- [x] Focused split-layout authentication pages

## Verification
- [x] TypeScript validation
- [x] Production build with project environment
- [ ] Sign-up creates a session and reaches the dashboard
- [ ] Sign-in restores a session and reaches the dashboard
- [ ] Project create, autosave, duplicate, and archive flows
- [ ] Upload, timeline editing, and export flows
- [x] Desktop and mobile browser review of public and authentication routes

## Deliberately deferred beyond MVP
- [ ] Automatic speech-to-lyrics transcription
- [ ] Real-time multi-user collaboration
- [ ] Billing and subscription enforcement
- [ ] Brand kits and custom font uploads
- [ ] Advanced masks, chroma key, and color grading
