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
  CircularProgress, // Import CircularProgress
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
  const { sites, getManageableSites } = useSite();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    avatar: '',
    siteId: '',
    baseRole: SiteRoles.USER,
    siteAdminRoles: []
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const canAssignGlobalAdmin = isGlobalAdmin && isGlobalAdmin();

  useEffect(() => {
    if (user) {
      const siteAdminRoles = [];
      let baseRole = SiteRoles.USER;
      
      if (Array.isArray(user.roles)) {
        if (user.roles.includes(SiteRoles.GLOBAL_ADMIN)) {
          baseRole = SiteRoles.GLOBAL_ADMIN;
        } else {
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
        password: '',
        avatar: user.avatar || '',
        baseRole: baseRole,
        siteAdminRoles: siteAdminRoles,
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
      baseRole: SiteRoles.USER,
      siteAdminRoles: [],
      siteId: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'baseRole') {
      if (value === SiteRoles.GLOBAL_ADMIN || value === SiteRoles.USER) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          siteAdminRoles: []
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

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleToggleSiteAdmin = (siteName) => {
    const roleToToggle = `${siteName}_site_admin`;
    
    setFormData(prev => {
      const hasRole = prev.siteAdminRoles.includes(roleToToggle);
      
      if (hasRole) {
        return {
          ...prev,
          siteAdminRoles: prev.siteAdminRoles.filter(role => role !== roleToToggle)
        };
      } else {
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

    if (!formData.id && !formData.password) {
      newErrors.password = t('userManagement.passwordRequiredForNewUsers');
    }

    if (formData.baseRole === SiteRoles.SITE_ADMIN && formData.siteAdminRoles.length === 0) {
      newErrors.siteAdminRoles = t('userManagement.selectAtLeastOneSite');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => { // Make handleSubmit async
    if (validateForm()) {
      setIsLoading(true); // Set loading to true
      let userData = { ...formData };

      if (!userData.avatar) {
        const firstInitial = userData.firstName ? userData.firstName[0] : '';
        const lastInitial = userData.lastName ? userData.lastName[0] : '';
        userData.avatar = `${firstInitial}${lastInitial}`.toUpperCase();
      }

      if (userData.id && !userData.password) {
        const { password, ...dataWithoutPassword } = userData;
        userData = dataWithoutPassword;
      }

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
      
      userData.roles = roles;
      
      delete userData.baseRole;
      delete userData.siteAdminRoles;

      try {
        await onSave(userData); // Wait for the save operation
      } catch (error) {
        console.error("Error saving user:", error);
      } finally {
        setIsLoading(false); // Set loading to false regardless of success or failure
      }
    } else {
      const errorFields = Object.keys(errors).map(field => t(`userManagement.${field}`));
      if (errorFields.length > 0) {
        console.error(`${t('userManagement.correctErrorFields')} ${errorFields.join(', ')}`);
      }
    }
  };

  const generateRandomPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    for (let i = 0; i < 8; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    setFormData({
      ...formData,
      password: password
    });

    return password;
  };

  const copyPasswordToClipboard = async () => {
    if (formData.password) {
      try {
        await navigator.clipboard.writeText(formData.password);
        setCopiedToClipboard(true);
        setShowSnackbar(true);

        setTimeout(() => {
          setCopiedToClipboard(false);
        }, 2000);
      } catch (err) {
        console.error(t('userManagement.unableToCopyPassword'), err);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case SiteRoles.GLOBAL_ADMIN:
        return 'gold';
      case SiteRoles.SITE_ADMIN:
        return '#f44336';
      default:
        return 'primary.main';
    }
  };

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

  const availableSitesForAdminSelection = getManageableSites();

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
                {availableSitesForAdminSelection.map(site => { 
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
        <Button onClick={onClose} disabled={isLoading}> {/* Disable cancel button during loading */}
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isLoading} // Disable submit button during loading
          sx={{ minWidth: 100 }} // Ensure button width doesn't jump too much
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : (formData.id ? t('common.update') : t('common.confirm'))}
        </Button>
        {formData.id && (
          <Button
            variant="contained"
            color="error"
            onClick={() => onDelete(formData.id)}
            disabled={isLoading} // Disable delete button during loading
          >
            {t('common.delete')}
          </Button>
        )}
      </DialogActions>

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