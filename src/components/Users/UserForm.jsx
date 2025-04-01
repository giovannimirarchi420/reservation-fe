import React, {useEffect, useState, useContext} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import { FederationRoles } from '../../services/federationService';
import { AuthContext } from '../../context/AuthContext';
import { useFederation } from '../../context/FederationContext';

const UserForm = ({ open, onClose, user, onSave, onDelete }) => {
  const { t } = useTranslation();
  const { isGlobalAdmin } = useContext(AuthContext);
  const { federations, currentFederation } = useFederation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    avatar: '',
    role: FederationRoles.USER.toLowerCase(),
    federationId: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Check if user is global admin (to determine if they can assign GLOBAL_ADMIN role)
  const canAssignGlobalAdmin = isGlobalAdmin && isGlobalAdmin();

  // Populate the form when a user is selected
  useEffect(() => {
    if (user) {
      // Determine the highest role for single selection
      let highestRole = FederationRoles.USER;
      
      // Case 1: user.roles exists as an array
      if (Array.isArray(user.roles)) {
        if (user.roles.includes(FederationRoles.GLOBAL_ADMIN)) {
          highestRole = FederationRoles.GLOBAL_ADMIN;
        } else if (user.roles.includes(FederationRoles.FEDERATION_ADMIN)) {
          highestRole = FederationRoles.FEDERATION_ADMIN;
        }
      } 
      // Case 2: user.role exists as a string
      else if (typeof user.role === 'string') {
        // Legacy role mapping
        if (user.role.toLowerCase() === 'global_admin') {
          highestRole = FederationRoles.GLOBAL_ADMIN;
        } else if (user.role.toLowerCase() === 'federation_admin') {
          highestRole = FederationRoles.FEDERATION_ADMIN;
        }
      }
      
      setFormData({
        id: user.id,
        username: user.username || user.name || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        password: '',  // For security reasons, don't prefill password
        avatar: user.avatar || '',
        role: highestRole, // Single role selection
        federationId: user.federationId || (currentFederation ? currentFederation.id : '')
      });
    } else {
      resetForm();
    }
  }, [user, currentFederation]);

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      avatar: '',
      role: FederationRoles.USER, // Default to regular user
      federationId: currentFederation ? currentFederation.id : ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Log the role change to debug
    if (name === 'role') {
      console.log('Role changed to:', value);
    }
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Remove errors when the user modifies the field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = t('userManagement.username') + ' ' + t('common.isRequired');
    }

    if (!formData.email) {
      newErrors.email = t('userManagement.email') + ' ' + t('common.isRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('userManagement.invalidEmail');
    }

    if (!formData.firstName) {
      newErrors.firstName = t('userManagement.firstName') + ' ' + t('common.isRequired');
    }

    if (!formData.lastName) {
      newErrors.lastName = t('userManagement.lastName') + ' ' + t('common.isRequired');
    }

    // Require password only for new users
    if (!formData.id && !formData.password) {
      newErrors.password = t('userManagement.passwordRequiredForNewUsers');
    }

    // Require federation selection when currentFederation is null or "all"
    if (!formData.federationId && (!currentFederation || currentFederation === "all")) {
      newErrors.federationId = t('errors.federation') + ' ' + t('common.isRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Generate avatar from initials if not specified
      let userData = { ...formData };

      if (!userData.avatar) {
        const firstInitial = userData.firstName ? userData.firstName[0] : '';
        const lastInitial = userData.lastName ? userData.lastName[0] : '';
        userData.avatar = `${firstInitial}${lastInitial}`.toUpperCase();
      }

      // If it's an update and password is empty, remove it
      if (userData.id && !userData.password) {
        const { password, ...dataWithoutPassword } = userData;
        userData = dataWithoutPassword;
      }

      // If no federation is explicitly selected but current federation exists, use that
      if (!userData.federationId && currentFederation && currentFederation !== "all") {
        userData.federationId = currentFederation.id;
      }

      // Convert single role to array for backend
      userData.roles = [userData.role]; 
      
      console.log('Saving user with role:', userData.role);
      console.log('Converting to roles array:', userData.roles);

      onSave(userData);
    } else {
      // Notify form errors
      const errorFields = Object.keys(errors).map(field => t(`userManagement.${field}`));
      if (errorFields.length > 0) {
        console.error(`${t('userManagement.correctErrorFields')} ${errorFields.join(', ')}`);
      }
    }
  };

  // Function to generate a random password
  const generateRandomPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';
    // Make sure the password contains at least one character of each type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Add more random characters to reach 12 characters
    for (let i = 0; i < 8; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password characters
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    setFormData({
      ...formData,
      password: password
    });

    return password;
  };

  // Function to copy the password to the clipboard
  const copyPasswordToClipboard = async () => {
    if (formData.password) {
      try {
        await navigator.clipboard.writeText(formData.password);
        setCopiedToClipboard(true);
        setShowSnackbar(true);

        // Reset the icon after 2 seconds
        setTimeout(() => {
          setCopiedToClipboard(false);
        }, 2000);
      } catch (err) {
        console.error(t('userManagement.unableToCopyPassword'), err);
      }
    }
  };

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  // Get role color based on role
  const getRoleColor = (role) => {
    switch (role) {
      case FederationRoles.GLOBAL_ADMIN:
        return 'gold'; // Gold for global admins
      case FederationRoles.FEDERATION_ADMIN:
        return '#f44336'; // Red for federation admins
      default:
        return 'primary.main'; // Default blue for regular users
    }
  };

  // Get role name for display
  const getRoleName = (role) => {
    switch (role) {
      case FederationRoles.GLOBAL_ADMIN:
        return t('userManagement.globalAdministrator');
      case FederationRoles.FEDERATION_ADMIN:
        return t('userManagement.federationAdministrator');
      default:
        return t('userManagement.user');
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case FederationRoles.GLOBAL_ADMIN:
        return <SecurityIcon fontSize="small" sx={{ color: 'gold' }} />;
      case FederationRoles.FEDERATION_ADMIN:
        return <SupervisorAccountIcon fontSize="small" sx={{ color: '#f44336' }} />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  // Determine if we need to show federation selection
  const showFederationSelection = isGlobalAdmin() || (!currentFederation || currentFederation === "all" || currentFederation === null);
  
  // Should we show available federations to select from?
  const showAvailableFederations = showFederationSelection && federations.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{formData.id ? t('userManagement.editUser') : t('userManagement.newUser')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            label={t('userManagement.username')}
            name="username"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.username}
            helperText={errors.username}
          />

          <TextField
            label={t('userManagement.email')}
            name="email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              label={t('userManagement.firstName')}
              name="firstName"
              fullWidth
              value={formData.firstName}
              onChange={handleChange}
              required
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
            
            <TextField
              label={t('userManagement.lastName')}
              name="lastName"
              fullWidth
              value={formData.lastName}
              onChange={handleChange}
              required
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
          </Stack>

          <TextField
            label={formData.id ? t('userManagement.keepCurrentPassword') : t('userManagement.password')}
            name="password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required={!formData.id}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <Box sx={{ display: 'flex' }}>
                  <Tooltip title={t('userManagement.generatePassword')}>
                    <IconButton
                      onClick={() => generateRandomPassword()}
                      edge="end"
                    >
                      <VpnKeyIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t('userManagement.copyPassword')}>
                    <IconButton
                      onClick={copyPasswordToClipboard}
                      edge="end"
                      color={copiedToClipboard ? "success" : "default"}
                    >
                      {copiedToClipboard ? <CheckCircleIcon /> : <ContentCopyIcon />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={showPassword ? t('userManagement.hidePassword') : t('userManagement.showPassword')}>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
            }}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="user-role-label">{t('userManagement.role')}</InputLabel>
            <Select
              labelId="user-role-label"
              name="role"
              value={formData.role || FederationRoles.USER}
              label={t('userManagement.role')}
              onChange={handleChange}
              renderValue={(selected) => (
                <Chip 
                  label={getRoleName(selected)}
                  icon={getRoleIcon(selected)}
                  sx={{ 
                    bgcolor: selected === FederationRoles.GLOBAL_ADMIN ? 'rgba(255, 215, 0, 0.1)' : 
                           selected === FederationRoles.FEDERATION_ADMIN ? 'rgba(244, 67, 54, 0.1)' : 
                           'rgba(25, 118, 210, 0.1)',
                    color: getRoleColor(selected),
                    fontWeight: 'bold',
                    border: `1px solid ${getRoleColor(selected)}`
                  }}
                />
              )}
            >
                              <MenuItem value={FederationRoles.USER}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonIcon color="primary" />
                  <Typography>{t('userManagement.user')}</Typography>
                </Stack>
              </MenuItem>
              
              <MenuItem value={FederationRoles.FEDERATION_ADMIN}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SupervisorAccountIcon sx={{ color: '#f44336' }} />
                  <Typography>{t('userManagement.federationAdministrator')}</Typography>
                </Stack>
              </MenuItem>
              
              {/* Only show Global Admin option for users who are Global Admins themselves */}
              {canAssignGlobalAdmin && (
                <MenuItem value={FederationRoles.GLOBAL_ADMIN}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SecurityIcon sx={{ color: 'gold' }} />
                    <Typography>{t('userManagement.globalAdministrator')}</Typography>
                  </Stack>
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Federation selection field */}
          {showAvailableFederations && (
            <FormControl fullWidth margin="normal" required error={!!errors.federationId}>
              <InputLabel id="federation-label">{t('errors.federation')}</InputLabel>
              <Select
                labelId="federation-label"
                name="federationId"
                value={formData.federationId || ''}
                label={t('errors.federation')}
                onChange={handleChange}
              >
                <MenuItem value="">{t('errors.selectFederation')}</MenuItem>
                {federations.map(federation => (
                  <MenuItem key={federation.id} value={federation.id}>
                    {federation.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.federationId && <FormHelperText>{errors.federationId}</FormHelperText>}
            </FormControl>
          )}

          <TextField
            label={t('userManagement.avatarInitials')}
            name="avatar"
            fullWidth
            value={formData.avatar}
            onChange={handleChange}
            margin="normal"
            helperText={t('userManagement.autoGenerateInitials')}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          {formData.id ? t('common.update') : t('common.confirm')}
        </Button>
        {formData.id && (
          <Button
            variant="contained"
            color="error"
            onClick={() => onDelete(formData.id)}
          >
            {t('common.delete')}
          </Button>
        )}
      </DialogActions>

      {/* Feedback for copy operation */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={t('userManagement.passwordCopied')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Dialog>
  );
};

export default UserForm;