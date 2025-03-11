import React, {useEffect, useState} from 'react';
import {
  Box,
  Button, 
  CircularProgress,
  Stack,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import UserCard from '../Users/UserCard';
import UserForm from '../Users/UserForm';
import {createUser, deleteUser, fetchUsers, updateUser} from '../../services/userService';
import useApiError from '../../hooks/useApiError';

const UserManagement = () => {
  const { withErrorHandling } = useApiError();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [notification, setNotification] = useState(null);

  // Mostra una notifica
  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    
    // Rimuovi la notifica dopo 6 secondi
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Carica utenti
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        await withErrorHandling(async () => {
          const usersData = await fetchUsers();
          setUsers(usersData);
        }, {
          errorMessage: 'Impossibile caricare la lista degli utenti',
          showError: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [withErrorHandling]);

  // Filtra utenti in base alla ricerca e al ruolo
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === '' ||
        (user.roles && user.roles.includes(filterRole)) ||
        (filterRole === 'ADMIN' && user.role === 'admin') ||
        (filterRole === 'USER' && user.role === 'user');

    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    const result = await withErrorHandling(async () => {
      if (userData.id) {
        // Aggiorna un utente esistente
        const updatedUser = await updateUser(userData.id, userData);
        return { updated: true, user: updatedUser };
      } else {
        // Crea un nuovo utente
        const newUser = await createUser(userData);
        return { updated: false, user: newUser };
      }
    }, {
      errorMessage: userData.id 
        ? `Impossibile aggiornare l'utente "${userData.username}"` 
        : `Impossibile creare l'utente "${userData.username}"`,
      showError: true
    });

    if (result) {
      if (result.updated) {
        // Aggiorna utenti esistenti
        setUsers(users.map(user =>
            user.id === result.user.id ? result.user : user
        ));
        showNotification(`Utente "${result.user.username}" aggiornato con successo`);
      } else {
        // Aggiungi nuovo utente
        setUsers([...users, result.user]);
        showNotification(`Utente "${result.user.username}" creato con successo`);
      }
      setIsUserModalOpen(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Trova il nome dell'utente prima di eliminarlo
    const userToDelete = users.find(u => u.id === userId);
    const userName = userToDelete ? (userToDelete.username || `${userToDelete.firstName} ${userToDelete.lastName}`) : 'selezionato';

    const confirmation = window.confirm(`Sei sicuro di voler eliminare l'utente "${userName}"? Questa azione non può essere annullata.`);
    
    if (!confirmation) {
      return;
    }

    const success = await withErrorHandling(async () => {
      await deleteUser(userId);
      return true;
    }, {
      errorMessage: `Impossibile eliminare l'utente "${userName}"`,
      showError: true
    });

    if (success) {
      setUsers(users.filter(user => user.id !== userId));
      setIsUserModalOpen(false);
      showNotification(`Utente "${userName}" eliminato con successo`);
    }
  };

  return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h6">Utenti Registrati</Typography>
          <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
          >
            Aggiungi Utente
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
              placeholder="Cerca utenti..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                ),
              }}
          />

          <TextField
              select
              label="Ruolo"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                ),
              }}
          >
            <MenuItem value="">Tutti i ruoli</MenuItem>
            <MenuItem value="ADMIN">Amministratore</MenuItem>
            <MenuItem value="USER">Utente</MenuItem>
          </TextField>
        </Stack>

        {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
        ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              {filteredUsers.length === 0 ? (
                  <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Nessun utente trovato.
                    </Typography>
                  </Box>
              ) : (
                  filteredUsers.map(user => (
                      <UserCard
                          key={user.id}
                          user={user}
                          onEdit={() => handleEditUser(user)}
                          onDelete={() => handleDeleteUser(user.id)}
                      />
                  ))
              )}
            </Box>
        )}

        <UserForm
            open={isUserModalOpen}
            onClose={() => setIsUserModalOpen(false)}
            user={selectedUser}
            onSave={handleSaveUser}
            onDelete={handleDeleteUser}
        />

        {/* Notifica per le operazioni completate con successo */}
        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {notification && (
            <Alert
              onClose={() => setNotification(null)}
              severity={notification.severity}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          )}
        </Snackbar>
      </Box>
  );
};

export default UserManagement;