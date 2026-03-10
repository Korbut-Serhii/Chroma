# ◈ CHROMA — Color Palette Generator

A beautiful desktop color palette generator built with Electron.

![Dark editorial aesthetic with neon-green accents]

## Features

- **Generate** — Random palettes in 8 moods: Random, Warm, Cool, Pastel, Dark, Neon, Earth, Monochrome
- **Lock colors** — Lock individual swatches to keep them while regenerating the rest
- **Color Harmony** — Complementary, Triadic, Analogous, Split-Comp, Tetradic, Square
- **Gradient Studio** — Linear, Radial, and Conic gradients with custom stops
- **Saved Palettes** — Favourite palettes persist between sessions
- **Export** — CSS variables, SCSS variables, JSON, plain TXT
- **Copy formats** — Copy as HEX, RGB, or HSL

## Keyboard Shortcut

| Key | Action |
|-----|--------|
| `Space` | Generate new palette |

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Launch the app
npm start
```

## Requirements

- Node.js 18+
- npm 9+

## Project Structure

```
color-palette-app/
├── main.js          # Electron main process
├── preload.js       # Secure IPC bridge
├── package.json
└── src/
    ├── index.html   # App UI
    ├── styles.css   # Dark editorial styles
    └── app.js       # All app logic
```

## Design

Dark editorial aesthetic with:
- **Font**: Syne (display) + DM Mono (code)
- **Accent**: #C8FF57 (electric lime)
- **Theme**: Deep dark backgrounds with crisp borders

---

Made with ◈ Electron
Made by Weksar (Korbut Serhii)
