# 251108_ParametricTower

251108_ParametricTower is a browser-hosted generator for stacked tower slabs with procedural gradients. It combines React for the interface, Zustand for slider state, and a custom Three.js scene so you can twist, scale, and recolor hundreds of floor instances live in the viewport.

## Features
- React + Vite dev stack with hot reload for rapid experimentation.
- Three.js instanced slab system with parametric floor height, twist, and scale gradients.
- Slider-driven parameters powered by Leva + Zustand with fast reset behavior.
- Gradient color ramping between customizable endpoints using chroma-js helpers.

## Getting Started
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the printed localhost URL (defaults to `http://localhost:5173`) to explore the generator.

## Controls
- Use the floating Leva panel to adjust floor count, tower height, radius, twist, scale limits, and gradient mode.
- Start/End color pickers drive the vertical gradient; dropdown eases shape gradients.
- Use the Reset button beneath the panel description (in the sidebar) to jump back to defaults.
- Navigate the viewport with the mouse: left-drag orbit, right-drag pan, scroll zoom.
