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
    Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

    // Determine if the user is admin based on roles
    const isAdmin = user.roles ?
        user.roles.includes('ADMIN') :
        user.role === 'admin';

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
                            bgcolor: isAdmin ? 'secondary.main' : 'primary.main',
                            mr: 2
                        }}
                    >
                        {user.avatar}
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
                    <Chip
                        label={isAdmin ? t('userManagement.administrator') : t('userManagement.user')}
                        color={isAdmin ? 'secondary' : 'primary'}
                        size="small"
                    />
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