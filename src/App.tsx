import { Leva } from 'leva'
import './App.css'
import { TowerScene } from './components/TowerScene'
import { ControlsPanel } from './components/ControlsPanel'

function App() {
  return (
    <div className="app">
      <Leva
        titleBar={{ title: 'Tower Controls', drag: false }}
        collapsed={false}
        theme={{ sizes: { rootWidth: '320px' } }}
      />
      <header className="app__header">
        <div>
          <p className="eyebrow">Procedural tower massing tool</p>
          <h1>251108_ParametricTower</h1>
          <p className="subtitle">
            Parametric slabs, twist and scale gradients, and color ramps rendered with Three.js in the browser.
          </p>
        </div>
        <div className="badge-row">
          <span className="badge">three.js</span>
          <span className="badge">react</span>
          <span className="badge">zustand</span>
        </div>
      </header>
      <main className="app__layout">
        <section className="viewport">
          <TowerScene />
        </section>
        <aside className="sidebar">
          <ControlsPanel />
        </aside>
      </main>
    </div>
  )
}

export default App
