import React, {useContext, useEffect, useState} from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Paper
} from '@mui/material';
import {fetchUsers} from '../../services/userService';
import {formatDateForInput, formatDate} from '../../utils/dateUtils';
import {AuthContext} from '../../context/AuthContext';
import useApiError from '../../hooks/useApiError';
import {checkEventConflicts} from '../../services/bookingService';
import {ResourceStatus} from '../../services/resourceService';

const BookingForm = ({ open, onClose, booking, onSave, onDelete, resources }) => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const { withErrorHandling, notifyFormError } = useApiError();
  const [formData, setFormData] = useState({
    title: '',
    resourceId: '',
    start: null,
    end: null,
    description: '',
    userId: ''
  });
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [useCurrentUser, setUseCurrentUser] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [validationMessage, setValidationMessage] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Filtra le risorse disponibili (solo quelle ACTIVE)
  const activeResources = resources.filter(resource => resource.status === ResourceStatus.ACTIVE);

  // Carica utenti solo se l'utente corrente è admin
  useEffect(() => {
    const loadUsers = async () => {
      if (isAdmin()) {
        await withErrorHandling(async () => {
          const usersData = await fetchUsers();
          setUsers(usersData);
        }, {
          errorMessage: 'Impossibile caricare la lista degli utenti',
          showError: true
        });
      }
    };
    
    loadUsers();
  }, [isAdmin, withErrorHandling]);

  // Popola il form quando viene selezionato un evento
  useEffect(() => {
    if (booking) {
      // Determina se l'utente ha diritto di modificare questa prenotazione
      const isOwnBooking = booking.userId === currentUser?.id;
      const canEdit = isOwnBooking || isAdmin();
      setIsReadOnly(!canEdit);
      
      // Se l'utente è admin e l'ID utente della prenotazione non è l'utente corrente,
      // imposta useCurrentUser a false
      const bookingForOtherUser = isAdmin() && booking.userId && booking.userId !== currentUser?.id;
      setUseCurrentUser(!bookingForOtherUser);
      
      setFormData({
        id: booking.id,
        title: booking.title || '',
        resourceId: booking.resourceId || '',
        start: booking.start,
        end: booking.end,
        description: booking.description || '',
        userId: booking.userId || currentUser?.id || ''
      });
    } else {
      resetForm();
    }
  }, [booking, currentUser, isAdmin]);

  const resetForm = () => {
    setFormData({
      title: '',
      resourceId: '',
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000),
      description: '',
      userId: currentUser?.id || ''
    });
    setUseCurrentUser(true);
    setErrors({});
    setValidationMessage(null);
    setIsReadOnly(false);
  };

  const handleChange = (e) => {
    if (isReadOnly) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Rimuovi errori quando l'utente modifica il campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    
    // Reset del messaggio di validazione quando l'utente modifica qualcosa
    setValidationMessage(null);
  };

  const handleDateChange = (e) => {
    if (isReadOnly) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: new Date(value)
    });
    
    // Reset del messaggio di validazione quando l'utente modifica le date
    setValidationMessage(null);
  };

  const handleUserSelectionChange = (useCurrentUserValue) => {
    if (isReadOnly) return;
    
    setUseCurrentUser(useCurrentUserValue);
    
    if (useCurrentUserValue) {
      // Se l'utente decide di usare il proprio account, imposta userId al currentUser.id
      setFormData({
        ...formData,
        userId: currentUser?.id || ''
      });
    } else {
      // Altrimenti, resetta userId a vuoto o mantieni il valore attuale se non vuoto
      setFormData({
        ...formData,
        userId: formData.userId !== currentUser?.id ? formData.userId : ''
      });
    }
    
    // Reset del messaggio di validazione
    setValidationMessage(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title) {
      newErrors.title = 'Il titolo è obbligatorio';
    }
    
    if (!formData.resourceId) {
      newErrors.resourceId = 'La risorsa è obbligatoria';
    }
    
    if (!formData.start) {
      newErrors.start = 'La data di inizio è obbligatoria';
    }
    
    if (!formData.end) {
      newErrors.end = 'La data di fine è obbligatoria';
    } else if (formData.end <= formData.start) {
      newErrors.end = 'La data di fine deve essere successiva alla data di inizio';
    }
    
    if (!formData.userId) {
      newErrors.userId = 'L\'utente è obbligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verifica conflitti di prenotazione
  const checkConflicts = async () => {

    if(!validateForm()) {
      return;
    }

    if (!formData.resourceId || !formData.start || !formData.end) {
      return false;
    }
    
    setIsChecking(true);
    
    try {
      const result = await withErrorHandling(async () => {
        return await checkEventConflicts(
          formData.resourceId,
          formData.start,
          formData.end,
          formData.id
        );
      }, {
        errorMessage: 'Impossibile verificare la disponibilità della risorsa',
        showError: true,
        rethrowError: true
      });
      
      if (result) {
        // Verifica il formato della risposta del server
        if (result.data === false) {
          // Se data è false, c'è un conflitto
          setValidationMessage({
            type: 'error',
            text: result.message || 'La risorsa non è disponibile nel periodo selezionato'
          });
          return false;
        } else if (result.success === false) {
          setValidationMessage({
            type: 'error',
            text: result.message || 'Errore nella verifica dei conflitti, riprova più tardi'
          });
          return false;
        } else {
          // Se success è true o non è definito (compatibilità con versioni precedenti)
          setValidationMessage({
            type: 'success',
            text: 'La risorsa è disponibile nel periodo selezionato'
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    // Assicurati che userId sia impostato correttamente prima di validare
    if (useCurrentUser && currentUser) {
      formData.userId = currentUser.id;
    }
    
    if (validateForm()) {
      // Prima verifica i conflitti
      const noConflicts = await checkConflicts();
      
      if (noConflicts || window.confirm('Ci potrebbero essere conflitti con altre prenotazioni. Vuoi continuare?')) {
        onSave(formData);
      }
    } else {
      // Notifica errori di form
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        notifyFormError(`Per favore correggi i campi con errori: ${errorFields.join(', ')}`);
      }
    }
  };

  // Trova il nome della risorsa in base all'ID
  const getResourceName = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.name : 'Risorsa sconosciuta';
  };

  // Trova il nome dell'utente in base all'ID
  const getUserName = (userId) => {
    if (userId === currentUser?.id) {
      return `${currentUser.firstName} ${currentUser.lastName}` || currentUser.username || 'Tu';
    }
    
    const user = users.find(u => u.id === userId);
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.username || user.name || 'Utente';
    }
    
    return 'Utente sconosciuto';
  };

  // Renderizza la visualizzazione di sola lettura
  const renderReadOnlyView = () => {
    // Ottieni il nome della risorsa
    const resourceName = getResourceName(formData.resourceId);
    // Ottieni il nome dell'utente
    const userName = getUserName(formData.userId);
    
    return (
      <>
        <DialogTitle>Dettagli Prenotazione</DialogTitle>
        <DialogContent>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 2, mt: 1 }}>
            <Typography variant="h6" gutterBottom>{formData.title}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Risorsa</Typography>
              <Typography variant="body1">{resourceName}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Periodo</Typography>
              <Typography variant="body1">
                {formatDate(formData.start, 'dddd D MMMM YYYY')}
              </Typography>
              <Typography variant="body2">
                {formatDate(formData.start, 'HH:mm')} - {formatDate(formData.end, 'HH:mm')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Prenotato da</Typography>
              <Typography variant="body1">{userName}</Typography>
            </Box>
            
            {formData.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Descrizione</Typography>
                <Typography variant="body1">{formData.description}</Typography>
              </Box>
            )}
          </Paper>
          
          <Alert severity="info">
            Stai visualizzando una prenotazione creata da un altro utente. Non è possibile modificarla.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Chiudi
          </Button>
        </DialogActions>
      </>
    );
  };

  // Renderizza il form di modifica
  const renderEditForm = () => {
    return (
      <>
        <DialogTitle>{formData.id ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Titolo"
              name="title"
              fullWidth
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.title}
              helperText={errors.title}
            />
            
            <FormControl fullWidth margin="normal" required error={!!errors.resourceId}>
              <InputLabel id="resource-select-label">Risorsa</InputLabel>
              <Select
                labelId="resource-select-label"
                name="resourceId"
                value={formData.resourceId || ''}
                label="Risorsa"
                onChange={handleChange}
              >
                <MenuItem value="">Seleziona risorsa</MenuItem>
                {activeResources.map(resource => (
                  <MenuItem key={resource.id} value={resource.id}>
                    {resource.name} - {resource.specs}
                  </MenuItem>
                ))}
              </Select>
              {errors.resourceId && <FormHelperText>{errors.resourceId}</FormHelperText>}
              {activeResources.length === 0 && (
                <FormHelperText>Non ci sono risorse attive disponibili per la prenotazione</FormHelperText>
              )}
            </FormControl>

            {/* Section for user selection - only available for admins */}
            {isAdmin() && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <Divider sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Utente della prenotazione
                  </Typography>
                </Divider>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  In qualità di amministratore, puoi effettuare prenotazioni per altri utenti o a tuo nome.
                </Alert>
                
                <FormControl fullWidth>
                  <Select
                    value={useCurrentUser ? 'current' : 'other'}
                    onChange={(e) => handleUserSelectionChange(e.target.value === 'current')}
                  >
                    <MenuItem value="current">Prenota a mio nome ({currentUser?.name || currentUser?.username})</MenuItem>
                    <MenuItem value="other">Prenota per un altro utente</MenuItem>
                  </Select>
                </FormControl>
                
                {!useCurrentUser && (
                  <FormControl fullWidth margin="normal" required error={!!errors.userId}>
                    <InputLabel id="user-select-label">Seleziona utente</InputLabel>
                    <Select
                      labelId="user-select-label"
                      name="userId"
                      value={formData.userId || ''}
                      label="Seleziona utente"
                      onChange={handleChange}
                    >
                      <MenuItem value="">Seleziona utente</MenuItem>
                      {users.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name || user.username || `${user.firstName} ${user.lastName}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
                  </FormControl>
                )}
              </Box>
            )}
            
            {/* Date/time selection */}
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: 2, 
                mt: 1 
              }}
            >
              <TextField
                label="Data/Ora Inizio"
                name="start"
                type="datetime-local"
                fullWidth
                value={formatDateForInput(formData.start)}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.start}
                helperText={errors.start}
              />
              <TextField
                label="Data/Ora Fine"
                name="end"
                type="datetime-local"
                fullWidth
                value={formatDateForInput(formData.end)}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.end}
                helperText={errors.end}
              />
            </Box>
            
            {/* Pulsante per verificare conflitti */}
            <Box sx={{ mt: 1, mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={checkConflicts}
                disabled={isChecking || !formData.resourceId || !formData.start || !formData.end}
                fullWidth
                startIcon={isChecking ? <CircularProgress size={20} /> : null}
              >
                {isChecking ? 'Verifica in corso...' : 'Verifica disponibilità'}
              </Button>
            </Box>
            
            {/* Messaggio di validazione */}
            {validationMessage && (
              <Alert 
                severity={validationMessage.type} 
                sx={{ mt: 1, mb: 2 }}
              >
                {validationMessage.text}
              </Alert>
            )}
            
            <TextField
              label="Descrizione"
              name="description"
              fullWidth
              multiline
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Annulla
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={isChecking || activeResources.length === 0}
          >
            {formData.id ? 'Aggiorna' : 'Conferma'}
          </Button>
          {formData.id && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => onDelete(formData.id)}
              disabled={isChecking}
            >
              Elimina
            </Button>
          )}
        </DialogActions>
      </>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={isReadOnly ? "sm" : "md"}
      fullWidth
    >
      {isReadOnly ? renderReadOnlyView() : renderEditForm()}
    </Dialog>
  );
};

export default BookingForm;