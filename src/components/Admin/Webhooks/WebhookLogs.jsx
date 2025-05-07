import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { fetchWebhookLogs } from '../../../services/webhookService';
import { getEventTypeName } from '../../../models/webhook';
import useApiError from '../../../hooks/useApiError';
import { formatDate } from '../../../utils/dateUtils';

const WebhookLogs = ({ webhooks }) => {
  const { t } = useTranslation();
  const { withErrorHandling } = useApiError();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logDetails, setLogDetails] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [webhookFilter, setWebhookFilter] = useState('');
  const [successFilter, setSuccessFilter] = useState('');
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshToggle, setRefreshToggle] = useState(false); // New state to trigger refresh

  // Create a memoized function to load logs
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      await withErrorHandling(async () => {
        const filters = {
          page: page,
          size: rowsPerPage
        };
        
        if (webhookFilter) {
          filters.webhookId = webhookFilter;
        }
        
        if (successFilter !== '') {
          filters.success = successFilter === 'true';
        }
        
        const response = await fetchWebhookLogs(filters);
        
        // Handle the response structure
        if (response && response.success && response.data) {
          // Extract logs from the nested structure
          const logsData = response.data.content || response.data.logs?.content || [];
          setLogs(logsData);
          
          // Extract pagination information
          setTotalLogs(response.data.totalElements || 0);
          setTotalPages(response.data.totalPages || 0);
        } else {
          console.error('Unexpected API response structure:', response);
          setLogs([]);
          setTotalLogs(0);
          setTotalPages(0);
        }
      }, {
        errorMessage: t('webhooks.unableToLoadLogs'),
        showError: true
      });
    } catch (error) {
      console.error('Error loading webhook logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [withErrorHandling, t, webhookFilter, successFilter, page, rowsPerPage]);

  // Load webhook logs when dependencies change or refresh is triggered
  useEffect(() => {
    loadLogs();
  }, [loadLogs, refreshToggle]); // Added refreshToggle as dependency

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle webhook filter change
  const handleWebhookFilterChange = (event) => {
    setWebhookFilter(event.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  // Handle success filter change
  const handleSuccessFilterChange = (event) => {
    setSuccessFilter(event.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  // Handle refreshing logs - fixed by calling loadLogs directly
  const handleRefresh = () => {
    setRefreshToggle(prev => !prev); // Toggle the refresh state to trigger effect
  };

  // Get webhook name by ID
  const getWebhookName = (webhookId) => {
    const webhook = webhooks.find(w => w.id.toString() === webhookId?.toString());
    return webhook ? webhook.name : webhookId || 'Unknown';
  };

  // Show log details
  const handleShowLogDetails = (log) => {
    setLogDetails(log);
  };

  return (
    <>
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ mb: 3 }}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('webhooks.filterByWebhook')}</InputLabel>
          <Select
            value={webhookFilter}
            label={t('webhooks.filterByWebhook')}
            onChange={handleWebhookFilterChange}
          >
            <MenuItem value="">{t('webhooks.allWebhooks')}</MenuItem>
            {webhooks.map(webhook => (
              <MenuItem key={webhook.id} value={webhook.id}>
                {webhook.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t('webhooks.status')}</InputLabel>
          <Select
            value={successFilter}
            label={t('webhooks.status')}
            onChange={handleSuccessFilterChange}
          >
            <MenuItem value="">{t('webhooks.allStatuses')}</MenuItem>
            <MenuItem value="true">{t('webhooks.success')}</MenuItem>
            <MenuItem value="false">{t('webhooks.failed')}</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title={t('webhooks.refresh')}>
          <IconButton 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('webhooks.status')}</TableCell>
              <TableCell>{t('webhooks.date')}</TableCell>
              <TableCell>{t('webhooks.webhook')}</TableCell>
              <TableCell>{t('webhooks.eventType')}</TableCell>
              <TableCell>{t('webhooks.httpStatus')}</TableCell>
              <TableCell align="right">{t('webhooks.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {t('webhooks.noLogsFound')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Chip
                      icon={log.success ? <CheckCircleIcon /> : <ErrorIcon />}
                      label={log.success ? t('webhooks.success') : t('webhooks.failed')}
                      color={log.success ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(log.createdAt, 'DD/MM/YYYY HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    {log.webhook ? getWebhookName(log.webhook.id) : getWebhookName(log.webhookId)}
                  </TableCell>
                  <TableCell>{getEventTypeName(log.eventType)}</TableCell>
                  <TableCell>
                    {log.statusCode ? log.statusCode : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('webhooks.viewDetails')}>
                      <IconButton size="small" onClick={() => handleShowLogDetails(log)}>
                        <VisibilityIcon fontSize="small" />
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
        rowsPerPageOptions={[5, 10, 20, 50]}
      />

      {/* Log details dialog */}
      <Dialog
        open={!!logDetails}
        onClose={() => setLogDetails(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('webhooks.logDetails')}
        </DialogTitle>
        <DialogContent>
          {logDetails && (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('webhooks.webhook')}
                  </Typography>
                  <Typography>
                    {logDetails.webhook 
                      ? getWebhookName(logDetails.webhook.id) 
                      : getWebhookName(logDetails.webhookId)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('webhooks.date')}
                  </Typography>
                  <Typography>
                    {formatDate(logDetails.createdAt, 'DD/MM/YYYY HH:mm:ss')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('webhooks.eventType')}
                  </Typography>
                  <Chip
                    label={getEventTypeName(logDetails.eventType)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('webhooks.status')}
                  </Typography>
                  <Chip
                    icon={logDetails.success ? <CheckCircleIcon /> : <ErrorIcon />}
                    label={logDetails.success ? t('webhooks.success') : t('webhooks.failed')}
                    color={logDetails.success ? 'success' : 'error'}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('webhooks.httpStatus')}
                  </Typography>
                  <Typography>
                    {logDetails.statusCode ? logDetails.statusCode : '-'}
                  </Typography>
                </Box>

                {logDetails.resource && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('webhooks.resource')}
                    </Typography>
                    <Typography>
                      {logDetails.resource.name} (ID: {logDetails.resource.id})
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('webhooks.payload')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {logDetails.payload ? JSON.stringify(JSON.parse(logDetails.payload), null, 2) : ''}
                    </pre>
                  </Paper>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('webhooks.response')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {logDetails.response || '-'}
                    </pre>
                  </Paper>
                </Box>

                {logDetails.retryCount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('webhooks.retryCount')}
                    </Typography>
                    <Typography>
                      {logDetails.retryCount}
                    </Typography>
                  </Box>
                )}

                {logDetails.nextRetryAt && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('webhooks.nextRetryAt')}
                    </Typography>
                    <Typography>
                      {formatDate(logDetails.nextRetryAt, 'DD/MM/YYYY HH:mm:ss')}
                    </Typography>
                  </Box>
                )}
                
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDetails(null)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WebhookLogs;