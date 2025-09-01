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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { apiService, User } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load users';
      setError(errorMessage);
      console.error('Users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowDialog(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(userId);
        await loadUsers();
      } catch (err) {
        setError('Failed to delete user');
        console.error('Delete user error:', err);
      }
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.userId, userData);
      } else {
        await apiService.createUser(userData as Omit<User, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setShowDialog(false);
      await loadUsers();
    } catch (err) {
      setError('Failed to save user');
      console.error('Save user error:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchUsers(searchTerm);
      setUsers(response);
    } catch (err) {
      setError('Failed to search users');
      console.error('Search users error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
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
          Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          sx={{ fontWeight: 600, fontSize: '1rem', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}
        >
          Add User
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
              label="Search users"
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

      {/* Users Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#f4f6fb' } }}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {user.userId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {user.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      color={user.role === 'ADMIN' ? 'primary' : user.role === 'USER' ? 'default' : 'secondary'}
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.active ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={user.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit User">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(user.userId)}
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

      {/* Add/Edit User Dialog */}
      <UserDialog
        open={showDialog}
        user={editingUser}
        onClose={() => setShowDialog(false)}
        onSave={handleSaveUser}
      />
    </Box>
  );
};

interface UserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: 'USER',
    active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        userId: user.userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        department: user.department || '',
        role: user.role,
        active: user.active,
      });
    } else {
      setFormData({
        userId: '',
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        role: 'USER',
        active: true,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {user ? 'Edit User' : 'Add User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="User ID"
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                required
                disabled={!!user}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {user ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default Users;
