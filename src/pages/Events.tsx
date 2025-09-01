import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { apiService, UsageEventResponse, Customer } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Events: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<UsageEventResponse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    customerId: '',
    userId: '',
    vendor: '',
    model: '',
    apiType: '',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadEvents();
    loadCustomers();
  }, [page, rowsPerPage]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      const eventsParams: any = {
        ...filters,
        page,
        size: rowsPerPage,
      };
      
      if (user && user.role !== 'SUPERADMIN' && user.customerId) {
        eventsParams.customerId = user.customerId;
      }
      
      const response = await apiService.getEvents(eventsParams);
      setEvents(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load events';
      setError(errorMessage);
      console.error('Events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      if (user?.role === 'SUPERADMIN') {
        const response = await apiService.getCustomers();
        setCustomers(response);
      } else {
        setCustomers([]);
      }
    } catch (err: any) {
      console.error('Customers error:', err);
      setCustomers([]);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: string, value: string) => {
  setFilters(prev => ({ ...prev, [field]: value }));
  setPage(0);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && events.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-1px' }}>
          Usage Events
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Only show customer filter for SUPERADMIN */}
          {user?.role === 'SUPERADMIN' && (
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Customer</InputLabel>
                <Select
                  value={filters.customerId}
                  label="Customer"
                  onChange={(e) => handleFilterChange('customerId', e.target.value)}
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.customerId} value={customer.customerId}>
                      {customer.organizationName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Vendor"
              value={filters.vendor}
              onChange={(e) => handleFilterChange('vendor', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Model"
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="API Type"
              value={filters.apiType}
              onChange={(e) => handleFilterChange('apiType', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={loadEvents}
              sx={{ fontWeight: 600, fontSize: '1rem', borderRadius: 2 }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Events Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>API Type</TableCell>
                <TableCell>Tokens</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.eventId} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#f4f6fb' } }}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {event.eventId.substring(0, 12)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{event.customerId}</TableCell>
                  <TableCell>{event.userId}</TableCell>
                  <TableCell>{event.vendor}</TableCell>
                  <TableCell>{event.model}</TableCell>
                  <TableCell>
                    <Chip 
                      label={event.apiType} 
                      size="small" 
                      color="primary" 
                      variant="filled"
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    {event.totalTokens ? formatNumber(event.totalTokens) : '-'}
                  </TableCell>
                  <TableCell>
                    {event.totalCost ? formatCurrency(event.totalCost) : '-'}
                  </TableCell>
                  <TableCell>
                    {event.revenue ? formatCurrency(event.revenue) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={event.status || 'unknown'} 
                      size="small" 
                      color={getStatusColor(event.status || '')}
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    {event.timestamp ? format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add Event Dialog */}
    </Box>
  );
};

export default Events;
