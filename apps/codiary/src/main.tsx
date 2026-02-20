import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { Toaster } from '@/app/components/ui/sonner'
import '@/styles/index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <App />
    <Toaster position="bottom-center" />
  </StrictMode>,
)
