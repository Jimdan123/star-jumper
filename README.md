# SPACE ARCADE

A collection of five browser games built with HTML5 Canvas and Three.js — no engine, no frameworks, just vanilla JavaScript.

**Live site → [jimdan123.github.io/star-jumper](https://jimdan123.github.io/star-jumper/)**

---

## Games

### ★ Star Jumper — Platformer
Run and jump across three alien worlds. Collect every star to unlock the exit portal, stomp enemies for points, and don't fall off. Three lives to clear all three levels.

| Level | Name | Theme |
|-------|------|-------|
| 1 | Space Station Blues | Blue platforms, learn the ropes |
| 2 | Jungle Moon | Moving platforms, alien jungle |
| 3 | Lava Core | Fast enemies, volcanic terrain |

**Controls:** `A` / `D` move, `W` / `Space` jump, `R` restart

---

### ◈ Void Blaster — Shooter
Pilot a ship through endless asteroid waves. Thrust, rotate, and shoot to survive as long as possible. Enemies get faster each wave.

**Controls:** `W` thrust, `A` / `D` rotate, `Space` shoot

---

### ◉ Eclipse — Breakout
Circular arena breakout across five unique levels. Rotate your paddle to deflect the ball and shatter all orbital crystals. Power-ups spawn as you clear each ring.

| Level | Name | Mechanic |
|-------|------|----------|
| 1 | CORONA | Single ring, learn the curve |
| 2 | NEBULA | Two counter-rotating rings |
| 3 | PULSAR | Triple rings, speed up |
| 4 | VORTEX | Orbiting crystal clusters |
| 5 | ECLIPSE CORE | Maximum density, final challenge |

**Controls:** `A` / `D` rotate paddle, `Space` launch ball

---

### ◆ Radiant — Defense
You are locked at the center of an arena. Enemies spiral in from all 360°. Rotate to face any direction and shoot them down before they reach you. Wave difficulty scales continuously.

**Enemy types:** Drones, Splits, Frags, Gunners, Tanks

**Controls:** `A` / `D` rotate, `Space` shoot

---

### ▼ ABYSS — 3D Survival
First-person 3D survival game built with Three.js. Your deep-sea drone has crashed at the bottom of the Mariana Trench (11,000 m). Emergency power lasts 3 minutes.

**Objective:** Collect 5 power core fragments scattered across the seafloor → return to the wreckage → press `E` to activate the rescue beacon → survive an 8-second countdown while every creature converges on you.

**The flashlight mechanic:**
- Flashlight **ON** — you can see, but Lurkers hunt by your light
- Flashlight **OFF** — Lurkers lose interest, but Phantoms attack in the dark

**Pickups:**
- Cyan cores — collect all 5 to win
- Green cells — restore +25% emergency power
- Yellow nodes — 8-second damage shield

**Controls:** `WASD` swim, `Space` / `Shift` rise / dive, `Mouse` look, `F` flashlight, `E` interact

---

## Running Locally

The arcade hub and all games (except Star Jumper) are single HTML files — just open them in a browser.

```bash
git clone https://github.com/Jimdan123/star-jumper.git
cd star-jumper

# Open the hub
open index.html

# Or serve locally (avoids any CORS issues with Three.js CDN)
npx serve .
```

Star Jumper has its own dev build:

```bash
cd star-jumper
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → /dist
```

---

## Deployment

Every push to `main` auto-deploys via GitHub Actions to GitHub Pages.

```
.github/workflows/deploy.yml
```

The workflow uploads the entire repo root as a Pages artifact — no Jekyll, no build step for the HTML games. Star Jumper's source lives in the `star-jumper/` subdirectory and is served as-is (the built output is committed).

---

## Project Structure

```
/
├── index.html              # Arcade hub — animated game card gallery
├── star-jumper.html        # Platformer (Canvas 2D)
├── void-blaster.html       # Shooter (Canvas 2D)
├── eclipse.html            # Breakout (Canvas 2D)
├── radiant.html            # Defense (Canvas 2D)
├── survival.html           # 3D survival (Three.js)
├── .nojekyll               # Skips Jekyll processing on GitHub Pages
├── .github/
│   └── workflows/
│       └── deploy.yml      # Auto-deploy on push to main
└── star-jumper/            # Star Jumper Vite source (legacy subfolder)
    ├── src/
    └── ...
```

---

## Tech Stack

| Thing | Used for |
|-------|----------|
| HTML5 Canvas API | All 2D games |
| Three.js r128 | ABYSS 3D rendering |
| Three.js UnrealBloomPass | Glow / bloom post-processing |
| Web Audio API | Sound effects and ambient audio in all games |
| Orbitron (Google Fonts) | UI typography across all games |
| GitHub Actions | CI/CD auto-deploy |
| GitHub Pages | Hosting |

No game engine. No build step for the HTML games. Everything runs directly in the browser.

---

## License

MIT
