import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Header />
                <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
                  <Dashboard />
                </Container>
              </>
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <>
                <Header />
                <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
                  <Events />
                </Container>
              </>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <>
                <Header />
                <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
                  <Analytics />
                </Container>
              </>
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute requireSuperAdmin>
              <>
                <Header />
                <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
                  <Customers />
                </Container>
              </>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute requireAdmin>
              <>
                <Header />
                <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
                  <Users />
                </Container>
              </>
            </ProtectedRoute>
          } />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;
