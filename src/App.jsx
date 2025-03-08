import React, {useContext} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import BookingCalendar from './components/Booking/BookingCalendar';
import AdminPanel from './components/Admin/AdminPanel';
import LoginPage from './components/Auth/LoginPage';
import {AuthContext} from './context/AuthContext';
import {Box, CircularProgress, Typography} from '@mui/material';

// Componente che verifica l'autenticazione per le rotte protette
const ProtectedRoute = ({ element, requiredRole }) => {
  const { currentUser, loading, isAuthorized } = useContext(AuthContext);
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
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
  
  return element;
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
            <ProtectedRoute 
              element={
                <MainLayout currentSection="calendar" onSectionChange={() => {}}>
                  <BookingCalendar />
                </MainLayout>
              } 
              requiredRole="user"
            />
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute 
              element={
                <MainLayout currentSection="calendar" onSectionChange={() => {}}>
                  <BookingCalendar />
                </MainLayout>
              } 
              requiredRole="user"
            />
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute 
              element={
                <MainLayout currentSection="admin" onSectionChange={() => {}}>
                  <AdminPanel />
                </MainLayout>
              } 
              requiredRole="admin"
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