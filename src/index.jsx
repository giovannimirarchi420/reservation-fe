import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { ThemeProvider } from './theme/ThemeProvider';
import { SiteProvider } from './context/SiteContext';

// Import i18n configuration
import './i18n';

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <ErrorProvider>
            <ThemeProvider>
                <AuthProvider>
                    <SiteProvider>
                        <NotificationProvider>
                            <App />
                        </NotificationProvider>
                    </SiteProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorProvider>
    </React.StrictMode>
);