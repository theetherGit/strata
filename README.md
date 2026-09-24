# Neha's stratigraphic column

Companion labs for *The Missing Context: How Computers Actually Work*.
SvelteKit 2 + Svelte 5 + Tailwind 4, with shadcn-svelte style components built on bits-ui.

    npm install
    npm run dev      # local development
    npm run build    # outputs a single self-contained build/index.html

## Deploy to Cloudflare Pages
Build command `npm run build`, output directory `build`. The app uses the hash router,
so it works from any path with no redirect rules.

## Where things live
- `src/lib/data/chapters.ts`: every quiz, lab and mission
- `src/lib/sim/`: the virtual file system and practice shell (PowerShell, pip, venv, git)
- `src/lib/playgrounds/`: one interactive playground per chapter
- `src/lib/components/ui/`: button, card, tabs, radio group and friends
