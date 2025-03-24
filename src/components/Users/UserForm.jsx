import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const UserForm = ({ open, onClose, user, onSave, onDelete }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    avatar: '',
    roles: ['USER']
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Populate the form when a user is selected
  useEffect(() => {
    if (user) {
      // Improved role retrieval logic
      let userRoles = [];
      
      // Case 1: user.roles exists as an array
      if (Array.isArray(user.roles)) {
        userRoles = user.roles;
      } 
      // Case 2: user.role exists as a string
      else if (typeof user.role === 'string') {
        // Convert 'admin' or 'user' to uppercase format for consistency
        userRoles = [user.role.toUpperCase()];
      }
      // If it was not possible to determine a role, use USER as default
      if (userRoles.length === 0) {
        userRoles = ['USER'];
      }
      
      setFormData({
        id: user.id,
        username: user.username || user.name || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        password: '',  // Per motivi di sicurezza, non precompilare la password
        avatar: user.avatar || '',
        roles: userRoles
      });
    } else {
      resetForm();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      avatar: '',
      roles: ['USER']
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleRoleChange = (e) => {
    const value = e.target.value;
    // Ensure that roles is always an array
    const roles = Array.isArray(value) ? value : [value];
    setFormData({
      ...formData,
      roles
    });
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

      onSave(userData);
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
                <InputAdornment position="end">
                  <Stack direction="row">
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
                  </Stack>
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="user-role-label">{t('userManagement.role')}</InputLabel>
            <Select
              labelId="user-role-label"
              name="roles"
              value={formData.roles || ['USER']}
              label={t('userManagement.role')}
              onChange={handleRoleChange}
              multiple
            >
              <MenuItem value="USER">{t('userManagement.user')}</MenuItem>
              <MenuItem value="ADMIN">{t('userManagement.administrator')}</MenuItem>
            </Select>
          </FormControl>

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