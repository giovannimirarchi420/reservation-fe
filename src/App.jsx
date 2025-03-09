import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import BookingCalendar from './components/Booking/BookingCalendar';
import AdminPanel from './components/Admin/AdminPanel';
import LoginPage from './components/Auth/LoginPage';
import ProfileManagement from './components/Profile/ProfileManagement';
import Dashboard from './components/Dashboard/Dashboard';
import MyBookingsPage from './components/Booking/MyBookingsPage'; // Importa la nuova pagina
import { AuthContext } from './context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { ErrorProvider, useError } from './context/ErrorContext';
import ErrorNotification from './components/Common/ErrorNotification';

// Inizializzazione del gestore errori globale
const ErrorInitializer = ({ children }) => {
  const { handleApiError } = useError();
  
  useEffect(() => {
    // Inietta il gestore degli errori nell'ambiente globale
    // Sarà accessibile dai moduli dei servizi API
    window.__errorHandler = handleApiError;
    
    return () => {
      // Rimuovi il gestore degli errori quando il componente viene smontato
      delete window.__errorHandler;
    };
  }, [handleApiError]);
  
  return children;
};

// Componente wrapper per le rotte con layout
const LayoutWrapper = ({ element, currentSection, requiredRole }) => {
    const { currentUser, loading, isAuthorized } = useContext(AuthContext);
    const navigate = useNavigate();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
                <CircularProgress />
                <Typography>Caricamento...</Typography>
            </Box>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !isAuthorized(requiredRole)) {
        // Se l'utente sta tentando di accedere alla dashboard ma non è admin, reindirizza al calendario
        if (currentSection === 'dashboard') {
            return <Navigate to="/calendar" replace />;
        }
        // Per altre sezioni admin-only, reindirizza alla home
        return <Navigate to="/calendar" replace />;
    }

    const handleSectionChange = (section) => {
        switch(section) {
            case 'dashboard':
                navigate('/');
                break;
            case 'calendar':
                navigate('/calendar');
                break;
            case 'mybookings':
                navigate('/mybookings');
                break;
            case 'admin':
                navigate('/admin');
                break;
            case 'profile':
                navigate('/profile');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <MainLayout currentSection={currentSection} onSectionChange={handleSectionChange}>
            {element}
        </MainLayout>
    );
};

const App = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <ErrorProvider>
            <ErrorInitializer>
                <Router>
                    <Routes>
                        <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
                        <Route
                            path="/"
                            element={
                                <LayoutWrapper
                                    element={<Dashboard />}
                                    currentSection="dashboard"
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/calendar"
                            element={
                                <LayoutWrapper
                                    element={<BookingCalendar />}
                                    currentSection="calendar"
                                    requiredRole="user"
                                />
                            }
                        />
                        <Route
                            path="/mybookings"
                            element={
                                <LayoutWrapper
                                    element={<MyBookingsPage />}
                                    currentSection="mybookings"
                                    requiredRole="user"
                                />
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <LayoutWrapper
                                    element={<AdminPanel />}
                                    currentSection="admin"
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <LayoutWrapper
                                    element={<ProfileManagement />}
                                    currentSection="profile"
                                    requiredRole="user"
                                />
                            }
                        />
                        {/* Rotta per gestire i reindirizzamenti da Keycloak */}
                        <Route path="/callback" element={<Navigate to="/" replace />} />
                        {/* Rotta fallback */}
                        <Route path="*" element={<Navigate to="/calendar" replace />} />
                    </Routes>
                    
                    {/* Componente per visualizzare le notifiche di errore */}
                    <ErrorNotification />
                </Router>
            </ErrorInitializer>
        </ErrorProvider>
    );
};

export default App;