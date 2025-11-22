import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registrar service worker para PWA
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('✅ PWA instalada correctamente y lista para uso offline')
  },
  onUpdate: (registration) => {
    console.log('🔄 Nueva versión de PWA disponible')
  },
})
