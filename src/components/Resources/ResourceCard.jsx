import React from 'react';
import { useTranslation } from 'react-i18next';
import {
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

const ResourceCard = ({ resource, resourceType, onEdit, onDelete }) => {
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

    // Function to determine label and color based on numeric status
    const getStatusInfo = (statusCode) => {
        switch (statusCode) {
            case "ACTIVE":
                return { label: t('resourceCard.active'), color: 'success' };
            case "MAINTENANCE":
                return { label: t('resourceCard.maintenance'), color: 'warning' };
            case "UNAVAILABLE":
                return { label: t('resourceCard.unavailable'), color: 'error' };
            default:
                return { label: t('resourceCard.unknown'), color: 'default' };
        }
    };

    const statusInfo = getStatusInfo(resource.status);

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{resource.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {resourceType && (
                            <Chip
                                label={resourceType.name}
                                size="small"
                                sx={{
                                    mr: 1,
                                    backgroundColor: resourceType.color,
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            />
                        )}
                        <IconButton size="small" onClick={handleOpenMenu}>
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    <b>{t('resourceCard.specifications')}</b> {resource.specs}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    <b>{t('resourceCard.location')}</b> {resource.location}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    <b>{t('resourceCard.site')}</b> {resource.siteName}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
                    <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                        {t('resourceCard.id')} {resource.id}
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
                    <ListItemText>{t('resourceCard.edit')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary={t('resourceCard.delete')} primaryTypographyProps={{ color: 'error' }} />
                </MenuItem>
            </Menu>
        </Card>
    );
};

export default ResourceCard;