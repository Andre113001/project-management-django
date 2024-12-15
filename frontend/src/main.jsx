import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { MantineProvider } from '@mantine/core';

import { UserProvider } from './contexts/userProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <UserProvider>
        <App />
    </UserProvider>
)
