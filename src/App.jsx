import React, { useContext } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import BookingCalendar from './components/Booking/BookingCalendar';
import AdminPanel from './components/Admin/AdminPanel';
import LoginPage from './components/Auth/LoginPage';
import ProfileManagement from './components/Profile/ProfileManagement';
import { AuthContext } from './context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

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
        return <Navigate to="/" replace />;
    }

    const handleSectionChange = (section) => {
        switch(section) {
            case 'dashboard':
                navigate('/');
                break;
            case 'calendar':
                navigate('/calendar');
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
        <Router>
            <Routes>
                <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
                <Route
                    path="/"
                    element={
                        <LayoutWrapper
                            element={<BookingCalendar />}
                            currentSection="dashboard"
                            requiredRole="user"
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
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;