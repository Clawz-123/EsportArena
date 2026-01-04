import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ToastContainer
      position="top-right"
      theme="dark"
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      draggable={false}
      className="ea-toast-container"
      toastClassName="ea-toast"
      bodyClassName="ea-toast-body"
      progressClassName="ea-toast-progress"
    />
  </StrictMode>,
)
