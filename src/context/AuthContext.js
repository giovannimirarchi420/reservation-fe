import React, { createContext, useState, useEffect, useCallback } from 'react';

// Creazione del contesto
export const AuthContext = createContext();

// Utente di default per simulazione
const defaultUser = {
  id: 1,
  name: 'Mario Rossi',
  email: 'mario.rossi@example.com',
  role: 'admin',
  avatar: 'MR'
};

// Provider del contesto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simula il caricamento dell'utente al montaggio
  useEffect(() => {
    const loadUser = async () => {
      try {
        // In un'app reale, qui si farebbe una chiamata API per verificare la sessione
        setTimeout(() => {
          setCurrentUser(defaultUser);
          setLoading(false);
        }, 800); // Simula ritardo di rete
      } catch (err) {
        setError('Errore durante il caricamento dell\'utente');
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Funzione di login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // In un'app reale, qui si farebbe una chiamata API per autenticare l'utente
      if (email === 'mario.rossi@example.com' && password === 'password') {
        setCurrentUser(defaultUser);
        setError(null);
        return true;
      } else {
        setError('Credenziali non valide');
        return false;
      }
    } catch (err) {
      setError('Errore durante il login');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Funzione di logout
  const logout = useCallback(() => {
    // In un'app reale, qui si farebbe una chiamata API per invalidare la sessione
    setCurrentUser(null);
  }, []);

  // Verifica se l'utente è amministratore
  const isAdmin = useCallback(() => {
    return currentUser?.role === 'admin';
  }, [currentUser]);

  // Verifica se l'utente è autorizzato per una determinata azione
  const isAuthorized = useCallback((requiredRole = 'user') => {
    if (!currentUser) return false;
    
    if (requiredRole === 'admin') {
      return currentUser.role === 'admin';
    }
    
    return true; // Tutti gli utenti autenticati sono utenti base
  }, [currentUser]);

  // Valore del contesto
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isAuthorized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
