import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LiquidGlassProvider } from '@gatsby/liquidglassui'
import '@gatsby/liquidglassui/styles.css'
import './index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <LiquidGlassProvider nestedPolicy="surface">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </LiquidGlassProvider>,
)
