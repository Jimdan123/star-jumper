# ★ Star Jumper

A space-themed browser platformer built with HTML5 Canvas and vanilla JavaScript.

You play as a tiny astronaut stranded across hostile alien worlds. Collect every star on each level to unlock the escape portal — then fight your way through alien critters to reach it. Three lives, three worlds, one chance to make it home.

---

## About the Game

**Story:** Your ship crash-landed. The emergency beacon needs power crystals (stars) scattered across three planets. Collect them all, avoid the alien guardians, and jump through the escape portal to reach the next world.

**Worlds:**
| Level | Name | Theme | Difficulty |
|-------|------|--------|------------|
| 1 | Space Station Blues | Deep space, blue platforms | Easy — learn the ropes |
| 2 | Jungle Moon | Green alien jungle, moving platforms | Medium — trickier jumps |
| 3 | Lava Core | Red volcanic planet, fast enemies | Hard — precise movement required |

---

## Controls

| Key | Action |
|-----|--------|
| `←` / `A` | Move left |
| `→` / `D` | Move right |
| `↑` / `W` / `Space` | Jump |
| `R` | Restart (after win or game over) |

**Tips:**
- Collect **all stars** on a level before the exit portal will open
- **Jump on top of enemies** to stomp them (+50 points) — hitting them from the side kills you
- Moving platforms (levels 2 & 3) can carry you further — use them
- You have **3 lives** total across all levels
- Stars are worth **10 points** each; stomping an enemy is worth **50 points**

---

## Running Locally

### Requirements
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/star-jumper.git
cd star-jumper

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open your browser at **http://localhost:5173** and play.

### Other commands

```bash
npm run build    # Build for production → outputs to /dist
npm run preview  # Preview the production build locally
```

---

## Deploying to GitHub Pages (Live Website)

This repo is set up to **auto-deploy** every time you push to `main`. Once configured, your game will be live at:

```
https://YOUR_USERNAME.github.io/star-jumper/
```

### One-time setup

1. **Create the repo on GitHub** (name it `star-jumper`)

2. **Enable GitHub Pages** in your repo settings:
   - Go to `Settings` → `Pages`
   - Set **Source** to `Deploy from a branch`
   - Set **Branch** to `gh-pages` / `/ (root)`
   - Save

3. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/star-jumper.git
   git push -u origin main
   ```

4. GitHub Actions will automatically build and deploy. Check the **Actions** tab to watch it run (~1 minute). After that, your site is live!

> **Note:** If you rename the repo, update `base` in `vite.config.js` to match:
> ```js
> base: '/your-repo-name/',
> ```

---

## Project Structure

```
star-jumper/
├── index.html                  # Entry HTML
├── vite.config.js              # Vite build config
├── package.json
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages
└── src/
    ├── main.js                 # Entry point — sets up canvas and game loop
    ├── game.js                 # Game class — state, update, draw orchestration
    ├── levels.js               # Level data (platforms, enemies, stars, portals)
    ├── physics.js              # Collision detection and resolution
    ├── particles.js            # Particle system (spawn, tick, draw)
    ├── renderer.js             # All drawing functions
    └── style.css               # Page styles
```

---

## Tech Stack

- **Vanilla JavaScript** (ES Modules)
- **HTML5 Canvas API** — all game rendering
- **Vite** — local dev server + production bundler
- **GitHub Actions** — CI/CD for automatic deployment
- **GitHub Pages** — free static site hosting

No game engine, no heavy frameworks — just the browser's built-in graphics API.

---

## License

MIT — do whatever you want with it.
