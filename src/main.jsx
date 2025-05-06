import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "react-hot-toast";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster 
      position="top-right" 
      reverseOrder={false}
      toastOptions={{
        className: '',
        style: {
          border: '1px solid rgb(var(--color-primary-dark))',
          padding: '16px',
          color: 'rgb(var(--color-text-primary-dark))',
          background: 'rgb(var(--color-bg-dark))',
        },
        success: {
          style: {
            background: 'rgb(var(--color-bg-dark))',
            border: '1px solid rgb(34 197 94)', // green-500
          },
        },
        error: {
          style: {
            background: 'rgb(var(--color-bg-dark))',
            border: '1px solid rgb(239 68 68)', // red-500
          },
        },
      }}
    />
    <App />
  </StrictMode>,
)
