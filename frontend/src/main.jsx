import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Asegurando estilos globales para responsividad
const styles = document.createElement('style')
styles.textContent = `
  html, body, #root {
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`
document.head.appendChild(styles)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
