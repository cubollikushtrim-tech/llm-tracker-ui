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
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { apiService, Customer } from '../services/api';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomers();
      setCustomers(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load customers';
      setError(errorMessage);
      console.error('Customers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowDialog(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowDialog(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await apiService.deleteCustomer(customerId);
        await loadCustomers();
      } catch (err) {
        setError('Failed to delete customer');
        console.error('Delete customer error:', err);
      }
    }
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      if (editingCustomer) {
        await apiService.updateCustomer(editingCustomer.customerId, customerData);
      } else {
        await apiService.createCustomer(customerData as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setShowDialog(false);
      await loadCustomers();
    } catch (err) {
      setError('Failed to save customer');
      console.error('Save customer error:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadCustomers();
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchCustomers(searchTerm);
      setCustomers(response);
    } catch (err) {
      setError('Failed to search customers');
      console.error('Search customers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading && customers.length === 0) {
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
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCustomer}
          sx={{ fontWeight: 600, fontSize: '1rem', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}
        >
          Add Customer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ fontWeight: 600, fontSize: '1rem', borderRadius: 2 }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Customers Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer ID</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Contact Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Markup %</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.customerId} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#f4f6fb' } }}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {customer.customerId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {customer.organizationName}
                    </Typography>
                    {customer.address && (
                      <Typography variant="body2" color="textSecondary">
                        {customer.address}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{customer.contactEmail}</TableCell>
                  <TableCell>{customer.contactPhone || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${customer.markupPercentage}%`} 
                      size="small" 
                      color="primary" 
                      variant="filled"
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={customer.active ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={customer.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    {customer.createdAt ? format(new Date(customer.createdAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Customer">
                      <IconButton
                        size="small"
                        onClick={() => handleEditCustomer(customer)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Customer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteCustomer(customer.customerId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Customer Dialog */}
      <CustomerDialog
        open={showDialog}
        customer={editingCustomer}
        onClose={() => setShowDialog(false)}
        onSave={handleSaveCustomer}
      />
    </Box>
  );
};

interface CustomerDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: (customerData: Partial<Customer>) => void;
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({ open, customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    organizationName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    markupPercentage: 30,
    active: true,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        customerId: customer.customerId,
        organizationName: customer.organizationName,
        contactEmail: customer.contactEmail,
        contactPhone: customer.contactPhone || '',
        address: customer.address || '',
        markupPercentage: customer.markupPercentage,
        active: customer.active,
      });
    } else {
      setFormData({
        customerId: '',
        organizationName: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        markupPercentage: 30,
        active: true,
      });
    }
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {customer ? 'Edit Customer' : 'Add Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer ID"
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                required
                disabled={!!customer}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization Name"
                value={formData.organizationName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Markup Percentage"
                type="number"
                value={formData.markupPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, markupPercentage: parseFloat(e.target.value) || 0 }))}
                required
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {customer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default Customers;
