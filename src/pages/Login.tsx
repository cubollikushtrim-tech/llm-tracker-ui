import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: 4, boxShadow: '0 4px 24px rgba(0,82,204,0.12)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-1px' }}>
            LLM Usage Tracker
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
            sx={{ borderRadius: 2, mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
            sx={{ borderRadius: 2, mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, fontWeight: 600, fontSize: '1.1rem', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            Demo Credentials:
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontWeight: 500 }}>
            SUPERADMIN: admin@llmtracker.com / password123
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            Admin: john.smith@techcorp.com / password123
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            User: sarah.johnson@techcorp.com / password123
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            Admin: mike.davis@dataflow.com / password123
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            User: lisa.wang@aiinnovations.com / password123
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
