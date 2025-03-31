import React, { useState, useEffect } from 'react';
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
  TextField,
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
  FilterList as FilterListIcon,
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

  // Load webhook logs
  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        await withErrorHandling(async () => {
          const filters = {};
          if (webhookFilter) {
            filters.webhookId = webhookFilter;
          }
          if (successFilter !== '') {
            filters.success = successFilter === 'true';
          }
          
          const logsData = await fetchWebhookLogs(filters);
          setLogs(logsData);
          setTotalLogs(logsData.length); // Update this if BE returns paginated data with a count
        }, {
          errorMessage: t('webhooks.unableToLoadLogs'),
          showError: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [withErrorHandling, t, webhookFilter, successFilter]);

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
    setPage(0);
  };

  // Handle success filter change
  const handleSuccessFilterChange = (event) => {
    setSuccessFilter(event.target.value);
    setPage(0);
  };

  // Handle refreshing logs
  const handleRefresh = () => {
    // Simply re-trigger the effect
    setIsLoading(true);
  };

  // Get webhook name by ID
  const getWebhookName = (webhookId) => {
    const webhook = webhooks.find(w => w.id.toString() === webhookId.toString());
    return webhook ? webhook.name : webhookId;
  };

  // Show log details
  const handleShowLogDetails = (log) => {
    setLogDetails(log);
  };

  // Get paginated logs
  const getPaginatedLogs = () => {
    return logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

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
              getPaginatedLogs().map((log) => (
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
                  <TableCell>{getWebhookName(log.webhook?.id || log.webhookId)}</TableCell>
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
        rowsPerPageOptions={[5, 10, 25, 50]}
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
                    {getWebhookName(logDetails.webhook?.id || logDetails.webhookId)}
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