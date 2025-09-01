import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/events', label: 'Events', icon: <EventIcon /> },
    { path: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    ...(user?.role === 'SUPERADMIN' ? [{ path: '/customers', label: 'Customers', icon: <PeopleIcon /> }] : []),
    ...(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? [{ path: '/users', label: 'Users', icon: <PeopleIcon /> }] : []),
  ];

  return (
    <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(90deg, #0052cc 0%, #00b8d9 100%)', boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}>
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 4 } }}>
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 0, mr: 4, fontWeight: 700, letterSpacing: '-1px', color: '#fff', textShadow: '0 2px 8px rgba(0,82,204,0.12)' }}
        >
          LLM Usage Tracker
        </Typography>

        {isMobile ? (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '1rem',
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.18)' : 'transparent',
                  boxShadow: location.pathname === item.path ? '0 2px 8px rgba(0,82,204,0.08)' : 'none',
                  color: '#fff',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.28)',
                    boxShadow: '0 4px 16px rgba(0,82,204,0.12)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, opacity: 0.9 }}>
                {user.fullName}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{ color: '#fff' }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{ sx: { minWidth: 220, borderRadius: 2, boxShadow: '0 4px 24px rgba(0,82,204,0.12)' } }}
              >
                <MenuItem onClick={handleClose}>
                  <Typography variant="body2">
                    {user.email}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <Typography variant="body2">
                    Role: {user.role}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <Typography variant="body2">
                    Customer: {user.customerName || 'All Customers (Superadmin)'}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
          <Typography variant="body2" sx={{ color: '#fff', opacity: 0.7, fontWeight: 500 }}>
            v1.0.0
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
