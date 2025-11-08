# 251108_ParametricTower

251108_ParametricTower is a browser-hosted generator for stacked tower slabs with procedural gradients. It combines React for the interface, Zustand for slider state, and a custom Three.js scene so you can twist, scale, and recolor hundreds of floor instances live in the viewport.

## Features
- React + Vite dev stack with hot reload for rapid experimentation.
- Three.js-generated slab system with parametric twist/scale gradients and consistent floor spacing so towers grow upward naturally.
- Independent twist and scale gradient modes (linear, ease-in/out) with min/max clamps for stability.
- Floor spacing slider, slab thickness control, and floorplate side-count slider (3-10) to dial in proportions without compressing the stack.
- Slider-driven parameters powered by Leva + Zustand with fast reset behavior.
- Gradient color ramping between customizable endpoints using chroma-js helpers, baked per-vertex so each slab shows the transition clearly alongside refreshed lighting.
- Optional auto-rotate orbit controls plus grouped Leva folders for Structure, Gradients, Display, and Export.
- Export folder in the Leva panel downloads the current mesh (with per-vertex colors) as an OBJ straight to your browser's downloads folder.

## Getting Started
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the printed localhost URL (defaults to `http://localhost:5173`) to explore the generator.

## Controls
- Use the floating Leva panel folders (Structure, Gradients, Display) to adjust floor count, floor spacing, radius, slab thickness, and the number of polygon sides (3-10), along with twist/scale ranges.
- Start/End color pickers drive the vertical gradient; dropdown eases provide independent twist/scale progression.
- Toggle Auto Rotate to slowly spin the camera around the tower for presentations.
- Use the `Export` folder to download the OBJ at any time, and the footer button to reset everything back to defaults.
- Navigate the viewport with the mouse: left-drag orbit, right-drag pan, scroll zoom.
