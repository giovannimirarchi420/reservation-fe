import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Divider,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/it';
import 'moment/locale/en-gb';
import { formatDate } from '../../utils/dateUtils';
import useApiError from '../../hooks/useApiError';

// Import the audit log service
import { fetchAuditLogs, fetchAuditLogById } from '../../services/auditLogService';

// Utility function to get severity color
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'ERROR':
      return 'error';
    case 'WARNING':
      return 'warning';
    case 'INFO':
      return 'info';
    default:
      return 'default';
  }
};

// Utility function to get severity icon
const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'ERROR':
      return <ErrorIcon fontSize="small" />;
    case 'WARNING':
      return <WarningIcon fontSize="small" />;
    case 'INFO':
      return <InfoIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
};

// Log details dialog component
const LogDetailsDialog = ({ open, log, onClose }) => {
  const { t } = useTranslation();

  if (!log) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t('auditLogs.logDetails')}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('auditLogs.id')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {log.id}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('auditLogs.timestamp')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(log.timestamp, 'DD/MM/YYYY HH:mm:ss')}
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('auditLogs.username')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {log.username}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('auditLogs.federation')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {log.federationName || t('auditLogs.notApplicable')}
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('auditLogs.type')}
              </Typography>
              <Chip 
                label={log.logType} 
                variant="outlined" 
                color={log.logType === 'ADMIN' ? 'primary' : 'secondary'} 
                size="small"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('auditLogs.action')}
              </Typography>
              <Chip 
                label={log.action} 
                variant="outlined" 
                color={
                  log.action === 'CREATE' ? 'success' : 
                  log.action === 'UPDATE' ? 'info' : 
                  log.action === 'DELETE' ? 'error' : 'default'
                } 
                size="small"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('auditLogs.severity')}
              </Typography>
              <Chip 
                icon={getSeverityIcon(log.severity)}
                label={log.severity} 
                color={getSeverityColor(log.severity)} 
                size="small"
              />
            </Box>
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('auditLogs.entityType')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {log.entityType}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('auditLogs.entityId')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {log.entityId}
              </Typography>
            </Box>
          </Stack>
          
          <Divider sx={{ my: 1 }} />
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {t('auditLogs.details')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
              <Typography variant="body1">
                {log.details}
              </Typography>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Audit Logs Management component
const AuditLogsManagement = () => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [adminLogsCount, setAdminLogsCount] = useState(0);
  const [userLogsCount, setUserLogsCount] = useState(0);
  const [errorLogsCount, setErrorLogsCount] = useState(0);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    username: '',
    entityType: '',
    entityId: '',
    logType: '',
    action: '',
    severity: '',
    startDate: null,
    endDate: null,
    searchQuery: ''
  });
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load audit logs
  useEffect(() => {
    loadAuditLogs();
  }, [page, rowsPerPage, searchParams]);

  // Load audit logs from the API
  const loadAuditLogs = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await withErrorHandling(async () => {
        // Build filters from search params
        const filters = {};
        
        if (searchParams.searchQuery) filters.searchQuery = searchParams.searchQuery;
        if (searchParams.username) filters.username = searchParams.username;
        if (searchParams.entityType) filters.entityType = searchParams.entityType;
        if (searchParams.entityId) filters.entityId = searchParams.entityId;
        if (searchParams.logType) filters.logType = searchParams.logType;
        if (searchParams.action) filters.action = searchParams.action;
        if (searchParams.severity) filters.severity = searchParams.severity;
        
        // Add date range if both are provided
        if (searchParams.startDate) {
          filters.startDate = searchParams.startDate.toISOString();
        }

        if(searchParams.endDate) {
          filters.endDate = searchParams.endDate.toISOString();
        }
        
        // Add pagination
        filters.page = page;
        filters.size = rowsPerPage;

        const result = await fetchAuditLogs(filters);
        
        // Handle the new response structure
        if (result && result.success && result.data) {
          // Get logs from the nested data.logs array
          setLogs(result.data.logs || []);
          
          // Update totals from response
          setTotalLogs(result.data.totalElements || 0);
          setAdminLogsCount(result.data.adminLogsCount || 0);
          setUserLogsCount(result.data.userLogsCount || 0);
          setErrorLogsCount(result.data.errorLogsCount || 0);
        } else {
          console.error('Unexpected API response structure:', result);
          setLogs([]);
          setTotalLogs(0);
          setAdminLogsCount(0);
          setUserLogsCount(0);
          setErrorLogsCount(0);
        }
      }, {
        errorMessage: t('auditLogs.errorLoadingLogs'),
        showError: true
      });
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setErrorMessage(t('auditLogs.errorLoadingLogs'));
    } finally {
      setIsLoading(false);
    }
  };

  // View log details
  const handleViewLog = async (logId) => {
    setIsLoading(true);
    
    try {
      await withErrorHandling(async () => {
        const log = await fetchAuditLogById(logId);
        setSelectedLog(log);
        setIsLogDialogOpen(true);
      }, {
        errorMessage: t('auditLogs.errorLoadingLogDetails'),
        showError: true
      });
    } catch (error) {
      console.error('Error loading log details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search parameter changes
  const handleSearchParamChange = (param, value) => {
    setSearchParams(prev => ({
      ...prev,
      [param]: value
    }));
    setPage(0); // Reset to first page when changing search params
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchParams({
      username: '',
      entityType: '',
      entityId: '',
      logType: '',
      action: '',
      severity: '',
      startDate: null,
      endDate: null,
      searchQuery: ''
    });
    setPage(0);
  };

  // Toggle advanced filters visibility
  const toggleAdvancedFilters = () => {
    setAdvancedFiltersVisible(!advancedFiltersVisible);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(searchParams).some(value => 
      value !== '' && value !== null
    );
  };

  // Get badges for active filters
  const getFilterBadges = () => {
    const badges = [];
    
    if (searchParams.searchQuery) {
      badges.push({
        label: `${t('auditLogs.search')}: ${searchParams.searchQuery}`,
        key: 'searchQuery'
      });
    }
    
    if (searchParams.username) {
      badges.push({
        label: `${t('auditLogs.username')}: ${searchParams.username}`,
        key: 'username'
      });
    }
    
    if (searchParams.entityType) {
      badges.push({
        label: `${t('auditLogs.entityType')}: ${searchParams.entityType}`,
        key: 'entityType'
      });
    }
    
    if (searchParams.entityId) {
      badges.push({
        label: `${t('auditLogs.entityId')}: ${searchParams.entityId}`,
        key: 'entityId'
      });
    }
    
    if (searchParams.logType) {
      badges.push({
        label: `${t('auditLogs.type')}: ${searchParams.logType}`,
        key: 'logType'
      });
    }
    
    if (searchParams.action) {
      badges.push({
        label: `${t('auditLogs.action')}: ${searchParams.action}`,
        key: 'action'
      });
    }
    
    if (searchParams.severity) {
      badges.push({
        label: `${t('auditLogs.severity')}: ${searchParams.severity}`,
        key: 'severity'
      });
    }
    
    if (searchParams.startDate && searchParams.endDate) {
      badges.push({
        label: `${t('auditLogs.dateRange')}: ${formatDate(searchParams.startDate)} - ${formatDate(searchParams.endDate)}`,
        key: 'dateRange'
      });
    }
    
    return badges;
  };

  // Remove a specific filter
  const removeFilter = (key) => {
    if (key === 'dateRange') {
      handleSearchParamChange('startDate', null);
      handleSearchParamChange('endDate', null);
    } else {
      handleSearchParamChange(key, '');
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>{t('auditLogs.title')}</Typography>
      
      {/* Summary Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{t('auditLogs.totalLogs')}</Typography>
              <EventNoteIcon color="primary" />
            </Box>
            <Typography variant="h4">{totalLogs}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{t('auditLogs.adminLogs')}</Typography>
              <PersonIcon color="secondary" />
            </Box>
            <Typography variant="h4">{adminLogsCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{t('auditLogs.userLogs')}</Typography>
              <PersonIcon color="info" />
            </Box>
            <Typography variant="h4">{userLogsCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{t('auditLogs.errorLogs')}</Typography>
              <ErrorIcon color="error" />
            </Box>
            <Typography variant="h4">{errorLogsCount}</Typography>
          </CardContent>
        </Card>
      </Stack>
      
      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder={t('auditLogs.search')}
                value={searchParams.searchQuery}
                onChange={(e) => handleSearchParamChange('searchQuery', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Box>
            
            <Box>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  startIcon={<FilterIcon />} 
                  onClick={toggleAdvancedFilters}
                >
                  {advancedFiltersVisible 
                    ? t('auditLogs.hideFilters') 
                    : t('auditLogs.showFilters')}
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />} 
                  onClick={loadAuditLogs}
                >
                  {t('auditLogs.refresh')}
                </Button>
                
                {hasActiveFilters() && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={handleResetFilters}
                  >
                    {t('auditLogs.resetFilters')}
                  </Button>
                )}
              </Stack>
            </Box>
          </Stack>
          
          {/* Active filter badges */}
          {hasActiveFilters() && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {getFilterBadges().map((badge) => (
                  <Chip
                    key={badge.key}
                    label={badge.label}
                    onDelete={() => removeFilter(badge.key)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Advanced filters */}
          {advancedFiltersVisible && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>{t('auditLogs.type')}</InputLabel>
                  <Select
                    value={searchParams.logType}
                    onChange={(e) => handleSearchParamChange('logType', e.target.value)}
                    label={t('auditLogs.type')}
                  >
                    <MenuItem value="">{t('auditLogs.allTypes')}</MenuItem>
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                    <MenuItem value="USER">USER</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>{t('auditLogs.action')}</InputLabel>
                  <Select
                    value={searchParams.action}
                    onChange={(e) => handleSearchParamChange('action', e.target.value)}
                    label={t('auditLogs.action')}
                  >
                    <MenuItem value="">{t('auditLogs.allActions')}</MenuItem>
                    <MenuItem value="CREATE">CREATE</MenuItem>
                    <MenuItem value="UPDATE">UPDATE</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>{t('auditLogs.severity')}</InputLabel>
                  <Select
                    value={searchParams.severity}
                    onChange={(e) => handleSearchParamChange('severity', e.target.value)}
                    label={t('auditLogs.severity')}
                  >
                    <MenuItem value="">{t('auditLogs.allSeverities')}</MenuItem>
                    <MenuItem value="INFO">INFO</MenuItem>
                    <MenuItem value="WARNING">WARNING</MenuItem>
                    <MenuItem value="ERROR">ERROR</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label={t('auditLogs.username')}
                  value={searchParams.username}
                  onChange={(e) => handleSearchParamChange('username', e.target.value)}
                  placeholder={t('auditLogs.filterByUsername')}
                />
                
                <FormControl fullWidth>
                  <InputLabel>{t('auditLogs.entityType')}</InputLabel>
                  <Select
                    value={searchParams.entityType}
                    onChange={(e) => handleSearchParamChange('entityType', e.target.value)}
                    label={t('auditLogs.entityType')}
                  >
                    <MenuItem value="">{t('auditLogs.allEntityTypes')}</MenuItem>
                    <MenuItem value="RESOURCE">RESOURCE</MenuItem>
                    <MenuItem value="RESOURCE-TYPE">RESOURCE-TYPE</MenuItem>
                    <MenuItem value="EVENT">EVENT</MenuItem>
                    <MenuItem value="USER">USER</MenuItem>
                    <MenuItem value="NOTIFICATION">NOTIFICATION</MenuItem>
                    <MenuItem value="FEDERATION">FEDERATION</MenuItem>
                    <MenuItem value="FEDERATION-USER">FEDERATION-USER</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label={t('auditLogs.entityId')}
                  value={searchParams.entityId}
                  onChange={(e) => handleSearchParamChange('entityId', e.target.value)}
                  placeholder={t('auditLogs.filterByEntityId')}
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label={t('auditLogs.startDate')}
                  type="datetime-local"
                  value={searchParams.startDate ? moment(searchParams.startDate).format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => handleSearchParamChange('startDate', e.target.value ? moment(e.target.value) : null)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                
                <TextField
                  fullWidth
                  label={t('auditLogs.endDate')}
                  type="datetime-local"
                  value={searchParams.endDate ? moment(searchParams.endDate).format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => handleSearchParamChange('endDate', e.target.value ? moment(e.target.value) : null)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
      
      {/* Error message */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      
      {/* Logs table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('auditLogs.id')}</TableCell>
                <TableCell>{t('auditLogs.timestamp')}</TableCell>
                <TableCell>{t('auditLogs.username')}</TableCell>
                <TableCell>{t('auditLogs.federation')}</TableCell>
                <TableCell>{t('auditLogs.type')}</TableCell>
                <TableCell>{t('auditLogs.entityType')}</TableCell>
                <TableCell>{t('auditLogs.action')}</TableCell>
                <TableCell>{t('auditLogs.severity')}</TableCell>
                <TableCell>{t('auditLogs.details')}</TableCell>
                <TableCell align="right">{t('auditLogs.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      {t('auditLogs.noLogsFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{formatDate(log.timestamp, 'DD/MM/YYYY HH:mm')}</TableCell>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>{log.federationName || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={log.logType} 
                        size="small" 
                        color={log.logType === 'ADMIN' ? 'primary' : 'secondary'} 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell>
                      <Chip 
                        label={log.action} 
                        size="small" 
                        color={
                          log.action === 'CREATE' ? 'success' : 
                          log.action === 'UPDATE' ? 'info' : 
                          log.action === 'DELETE' ? 'error' : 'default'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={getSeverityIcon(log.severity)}
                        label={log.severity} 
                        size="small" 
                        color={getSeverityColor(log.severity)}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={log.shortDetails || log.details}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {log.shortDetails || log.details}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('auditLogs.viewDetails')}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewLog(log.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalLogs}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
      
      {/* Log details dialog */}
      <LogDetailsDialog
        open={isLogDialogOpen}
        log={selectedLog}
        onClose={() => setIsLogDialogOpen(false)}
      />
    </Box>
  );
};

export default AuditLogsManagement;