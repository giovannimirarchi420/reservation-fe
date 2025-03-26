import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
    Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import { FederationRoles } from '../../services/federationService';

const UserCard = ({ user, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);
    
    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        handleCloseMenu();
        onEdit();
    };

    const handleDelete = () => {
        handleCloseMenu();
        onDelete();
    };

    // Determine the highest user role
    const getUserRole = () => {
        // Check for roles array first
        if (Array.isArray(user.roles)) {
            if (user.roles.includes(FederationRoles.GLOBAL_ADMIN)) {
                return FederationRoles.GLOBAL_ADMIN;
            }
            if (user.roles.includes(FederationRoles.FEDERATION_ADMIN)) {
                return FederationRoles.FEDERATION_ADMIN;
            }
            return FederationRoles.USER;
        }
        
        // Fallback to legacy role field
        if (typeof user.role === 'string') {
            const role = user.role.toUpperCase();
            if (role === 'GLOBAL_ADMIN' || role === 'ADMIN') {
                return FederationRoles.GLOBAL_ADMIN;
            }
            if (role === 'FEDERATION_ADMIN') {
                return FederationRoles.FEDERATION_ADMIN;
            }
        }
        
        return FederationRoles.USER;
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
                return <SecurityIcon fontSize="small" sx={{ mr: 1, color: 'gold' }} />;
            case FederationRoles.FEDERATION_ADMIN:
                return <SupervisorAccountIcon fontSize="small" sx={{ mr: 1, color: '#f44336' }} />;
            default:
                return <PersonIcon fontSize="small" sx={{ mr: 1 }} />;
        }
    };

    // Calculate the user role
    const userRole = getUserRole();
    const roleColor = getRoleColor(userRole);
    const roleName = getRoleName(userRole);
    const roleIcon = getRoleIcon(userRole);

    // Generate the full name for display
    const displayName = user.firstName && user.lastName ?
        `${user.firstName} ${user.lastName}` :
        user.username || user.name || t('userManagement.user');

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: roleColor,
                            mr: 2,
                            border: userRole === FederationRoles.GLOBAL_ADMIN ? '2px solid white' : 'none'
                        }}
                    >
                        {user.avatar || displayName.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{displayName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleOpenMenu}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tooltip title={roleIcon}>
                        <Chip
                            icon={roleIcon}
                            label={roleName}
                            sx={{ 
                                bgcolor: userRole === FederationRoles.GLOBAL_ADMIN ? 'rgba(255, 215, 0, 0.1)' : 
                                        userRole === FederationRoles.FEDERATION_ADMIN ? 'rgba(244, 67, 54, 0.1)' : 
                                        'rgba(25, 118, 210, 0.1)',
                                color: roleColor,
                                fontWeight: 'bold',
                                border: `1px solid ${roleColor}`
                            }}
                            size="small"
                        />
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                        ID: {user.id}
                    </Typography>
                </Box>
            </CardContent>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('userManagement.editUser')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary={t('userManagement.delete')} primaryTypographyProps={{ color: 'error' }} />
                </MenuItem>
            </Menu>
        </Card>
    );
};

export default UserCard;