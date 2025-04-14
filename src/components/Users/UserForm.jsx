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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Chip,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import { SiteRoles } from '../../services/siteService';
import { AuthContext } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

const UserForm = ({ open, onClose, user, onSave, onDelete }) => {
  const { t } = useTranslation();
  const { isGlobalAdmin } = useContext(AuthContext);
  const { sites } = useSite();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    avatar: '',
    siteId: '',
    // Simple role for display (global_admin, site_admin, user)
    baseRole: SiteRoles.USER,
    // Array of site-specific admin roles in format siteName_site_admin
    siteAdminRoles: []
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
      // Extract site admin roles from all roles
      const siteAdminRoles = [];
      let baseRole = SiteRoles.USER;
      
      // Case 1: user.roles exists as an array
      if (Array.isArray(user.roles)) {
        if (user.roles.includes(SiteRoles.GLOBAL_ADMIN)) {
          baseRole = SiteRoles.GLOBAL_ADMIN;
        } else {
          // Look for site-specific admin roles in format siteName_site_admin
          const sitesAdminRoleList = user.roles.filter(role => role.endsWith('_site_admin'));
          
          if (sitesAdminRoleList.length > 0) {
            baseRole = SiteRoles.SITE_ADMIN;
            siteAdminRoles.push(...sitesAdminRoleList);
          }
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
        baseRole: baseRole, // Single role selection
        siteAdminRoles: siteAdminRoles, // Site admin roles list
        siteId: user.siteId || ''
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
      baseRole: SiteRoles.USER, // Default to regular user
      siteAdminRoles: [],
      siteId: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special case for baseRole - reset siteAdminRoles when changed to global_admin or user
    if (name === 'baseRole') {
      if (value === SiteRoles.GLOBAL_ADMIN || value === SiteRoles.USER) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          siteAdminRoles: [] // Clear site admin roles when not a site admin
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Remove errors when the user modifies the field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  // Handle toggling a site admin role
  const handleToggleSiteAdmin = (siteName) => {
    const roleToToggle = `${siteName}_site_admin`;
    
    setFormData(prev => {
      // Check if this role already exists
      const hasRole = prev.siteAdminRoles.includes(roleToToggle);
      
      if (hasRole) {
        // Remove the role
        return {
          ...prev,
          siteAdminRoles: prev.siteAdminRoles.filter(role => role !== roleToToggle)
        };
      } else {
        // Add the role
        return {
          ...prev,
          siteAdminRoles: [...prev.siteAdminRoles, roleToToggle]
        };
      }
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

    // Validate site admin roles if baseRole is site_admin
    if (formData.baseRole === SiteRoles.SITE_ADMIN && formData.siteAdminRoles.length === 0) {
      newErrors.siteAdminRoles = t('userManagement.selectAtLeastOneSite');
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

      // Prepare roles array based on baseRole and siteAdminRoles
      let roles = [];
      
      switch(userData.baseRole) {
        case SiteRoles.GLOBAL_ADMIN:
          roles = [SiteRoles.GLOBAL_ADMIN, SiteRoles.USER];
          break;
        case SiteRoles.SITE_ADMIN:
          roles = [...userData.siteAdminRoles, SiteRoles.USER];
          break;
        case SiteRoles.USER:
        default:
          roles = [SiteRoles.USER];
          break;
      }
      
      // Set the roles array
      userData.roles = roles;
      
      // Remove the baseRole and siteAdminRoles fields which are used only for the UI
      delete userData.baseRole;
      delete userData.siteAdminRoles;

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
      case SiteRoles.GLOBAL_ADMIN:
        return 'gold'; // Gold for global admins
      case SiteRoles.SITE_ADMIN:
        return '#f44336'; // Red for site admins
      default:
        return 'primary.main'; // Default blue for regular users
    }
  };

  // Get role name for display
  const getRoleName = (role) => {
    switch (role) {
      case SiteRoles.GLOBAL_ADMIN:
        return t('userManagement.globalAdministrator');
      case SiteRoles.SITE_ADMIN:
        return t('userManagement.siteAdministrator');
      default:
        return t('userManagement.user');
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case SiteRoles.GLOBAL_ADMIN:
        return <SecurityIcon fontSize="small" sx={{ color: 'gold' }} />;
      case SiteRoles.SITE_ADMIN:
        return <SupervisorAccountIcon fontSize="small" sx={{ color: '#f44336' }} />;
      default:
        return <PersonIcon fontSize="small" />;
    }
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
              name="baseRole"
              value={formData.baseRole || SiteRoles.USER}
              label={t('userManagement.role')}
              onChange={handleChange}
              renderValue={(selected) => (
                <Chip 
                  label={getRoleName(selected)}
                  icon={getRoleIcon(selected)}
                  sx={{ 
                    bgcolor: selected === SiteRoles.GLOBAL_ADMIN ? 'rgba(255, 215, 0, 0.1)' :
                           selected === SiteRoles.SITE_ADMIN ? 'rgba(244, 67, 54, 0.1)' :
                           'rgba(25, 118, 210, 0.1)',
                    color: getRoleColor(selected),
                    fontWeight: 'bold',
                    border: `1px solid ${getRoleColor(selected)}`
                  }}
                />
              )}
            >
              <MenuItem value={SiteRoles.USER}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonIcon color="primary" />
                  <Typography>{t('userManagement.user')}</Typography>
                </Stack>
              </MenuItem>
              
              <MenuItem value={SiteRoles.SITE_ADMIN}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SupervisorAccountIcon sx={{ color: '#f44336' }} />
                  <Typography>{t('userManagement.siteAdministrator')}</Typography>
                </Stack>
              </MenuItem>
              
              {/* Only show Global Admin option for users who are Global Admins themselves */}
              {canAssignGlobalAdmin && (
                <MenuItem value={SiteRoles.GLOBAL_ADMIN}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SecurityIcon sx={{ color: 'gold' }} />
                    <Typography>{t('userManagement.globalAdministrator')}</Typography>
                  </Stack>
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Only show site selection when role is SITE_ADMIN */}
          {formData.baseRole === SiteRoles.SITE_ADMIN && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('userManagement.selectSitesForAdmin')}
              </Typography>
              
              {errors.siteAdminRoles && (
                <Typography color="error" variant="caption">
                  {errors.siteAdminRoles}
                </Typography>
              )}
              
              <FormGroup>
                {sites.map(site => {
                  const roleId = `${site.name}_site_admin`;
                  const isSelected = formData.siteAdminRoles.includes(roleId);
                  
                  return (
                    <FormControlLabel
                      key={site.id}
                      control={
                        <Checkbox 
                          checked={isSelected} 
                          onChange={() => handleToggleSiteAdmin(site.name)}
                        />
                      }
                      label={site.name}
                    />
                  );
                })}
              </FormGroup>
              
              {formData.siteAdminRoles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('userManagement.selectedSiteRoles')}:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {formData.siteAdminRoles.map(role => (
                      <Chip
                        key={role}
                        label={role.replace('_site_admin', '')}
                        color="secondary"
                        size="small"
                        variant="outlined"
                        onDelete={() => handleToggleSiteAdmin(role.replace('_site_admin', ''))}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
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