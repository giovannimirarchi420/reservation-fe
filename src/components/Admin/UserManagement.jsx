import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, TextField,
  InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import UserCard from '../Users/UserCard';
import UserForm from '../Users/UserForm';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Carica utenti
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  // Filtra utenti in base alla ricerca e al ruolo
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = filterRole === '' || user.role === filterRole;
    
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
    try {
      if (userData.id) {
        // Aggiorna un utente esistente
        const updatedUser = await updateUser(userData.id, userData);
        setUsers(users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ));
      } else {
        // Crea un nuovo utente
        const newUser = await createUser(userData);
        setUsers([...users, newUser]);
      }
      setIsUserModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      // Qui potrebbe essere visualizzato un messaggio di errore
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      setIsUserModalOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      // Qui potrebbe essere visualizzato un messaggio di errore
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
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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
          SelectProps={{
            native: true,
          }}
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
          <option value="">Tutti i ruoli</option>
          <option value="admin">Amministratore</option>
          <option value="user">Utente</option>
        </TextField>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nessun utente trovato.
              </Typography>
            </Box>
          ) : (
            filteredUsers.map(user => (
              <Grid item xs={12} md={6} lg={4} key={user.id}>
                <UserCard
                  user={user}
                  onEdit={() => handleEditUser(user)}
                  onDelete={() => handleDeleteUser(user.id)}
                />
              </Grid>
            ))
          )}
        </Grid>
      )}
      
      <UserForm
        open={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
      />
    </Box>
  );
};

export default UserManagement;
