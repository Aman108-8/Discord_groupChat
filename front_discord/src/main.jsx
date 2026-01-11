import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import WebRoutes from './config/WebRoutes.jsx'
import { Toaster } from 'react-hot-toast'
import { ChatProvider } from './context/ChatContext.jsx'

/*
React StrictMode intentionally runs certain logic twice in development to detect side-effects.
That’s why: Your WebSocket connects twice, Your subscription happens twice, So one send → two receives, When you remove <StrictMode>, the duplication disappears.
*/

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toaster position='top-center'/>
    {/* WebRoutes is inside <ChatProvider> so ALL pages can access chat data */}
    <ChatProvider>
        <WebRoutes/>
    </ChatProvider>
  </BrowserRouter>
)
