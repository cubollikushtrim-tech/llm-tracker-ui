import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert
} from '@mui/material';
import {
  CalendarToday,
  Memory,
  AttachMoney,
  TrendingUp
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsData {
  summary: {
    totalEvents: number;
    totalTokens: number;
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
  };
  usageByVendor: Record<string, number>;
  usageByModel: Record<string, number>;
  usageByApiType: Record<string, number>;
  timeSeriesData: Array<{
    date: string;
    events: number;
    cost: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerName: string;
    totalCost: number;
    eventCount: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [addingEvents, setAddingEvents] = useState(false);
  const handleAddRandomEvents = async () => {
    setAddingEvents(true);
    try {
      await apiService.addRandomEvents({ count: 10, todayOnly: true });
      await loadAnalytics();
    } catch (err) {
      setError('Failed to add random events');
    } finally {
      setAddingEvents(false);
    }
  };
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('30days');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const calculateDateRange = (range: string) => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (range) {
      case '7days':
        start = subDays(today, 7);
        break;
      case '30days':
        start = subDays(today, 30);
        break;
      case 'thismonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'thisyear':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      case 'alltime':
        start = new Date('2024-01-01');
        break;
      default:
        start = subDays(today, 30);
    }

    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    };
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { start, end } = calculateDateRange(dateRange);
      setStartDate(start);
      setEndDate(end);
      
      const analyticsParams: any = {
        startDate: start,
        endDate: end
      };
      
      if (user && user.role !== 'SUPERADMIN' && user.customerId) {
        analyticsParams.customerId = user.customerId;
      }
      
      const data = await apiService.getAnalytics(analyticsParams);
      
      const transformedData: AnalyticsData = {
        summary: {
          totalEvents: data.totalEvents || 0,
          totalTokens: data.totalTokens || 0,
          totalCost: data.totalCost || 0,
          totalRevenue: data.totalRevenue || 0,
          totalProfit: data.totalProfit || 0,
          profitMargin: data.profitMargin || 0
        },
        usageByVendor: data.usageByVendor || {},
        usageByModel: data.usageByModel || {},
        usageByApiType: data.usageByApiType || {},
        timeSeriesData: (data.timeSeriesData || []).map(item => ({
          date: item.date,
          events: item.events || 0,
          cost: item.cost || 0,
          revenue: item.revenue || 0
        })),
        topCustomers: (data.topCustomers || []).map(customer => ({
          customerName: customer.organizationName || customer.customerId || 'Unknown',
          totalCost: customer.cost || 0,
          eventCount: customer.events || 0
        }))
      };
      
      setAnalyticsData(transformedData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const handleDateRangeChange = (event: any) => {
    setDateRange(event.target.value);
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(1)}%`;
  };

  const getDateRangeLabel = (range: string): string => {
    switch (range) {
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case 'thismonth':
        return 'This Month';
      case 'thisyear':
        return 'This Year';
      case 'alltime':
        return 'All Time';
      default:
        return 'Last 30 Days';
    }
  };

  const formatDateRange = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!analyticsData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          No data available
        </Typography>
      </Container>
    );
  }

  const { summary, usageByVendor, timeSeriesData, topCustomers } = analyticsData;

  const sumVendor = Object.values(analyticsData.usageByVendor).reduce((a, b) => a + b, 0);
  const vendorData = Object.entries(analyticsData.usageByVendor).map(([vendor, count]) => ({
    name: vendor,
    value: sumVendor > 0 ? (count / sumVendor) * 100 : 0
  }));

  const sumModel = Object.values(analyticsData.usageByModel).reduce((a, b) => a + b, 0);
  const modelData = Object.entries(analyticsData.usageByModel).map(([model, count]) => ({
    name: model,
    value: sumModel > 0 ? (count / sumModel) * 100 : 0
  }));

  const sumApiType = Object.values(analyticsData.usageByApiType).reduce((a, b) => a + b, 0);
  const apiTypeData = Object.entries(analyticsData.usageByApiType).map(([type, count]) => ({
    name: type,
    value: sumApiType > 0 ? (count / sumApiType) * 100 : 0
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-1px' }}>
          Dashboard
        </Typography>
        {user?.role === 'SUPERADMIN' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              style={{
                padding: '8px 20px',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 8,
                background: 'linear-gradient(90deg, #0052cc 0%, #00b8d9 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,82,204,0.08)',
                cursor: addingEvents ? 'not-allowed' : 'pointer',
                opacity: addingEvents ? 0.6 : 1
              }}
              disabled={addingEvents}
              onClick={handleAddRandomEvents}
            >
              {addingEvents ? 'Adding Events...' : 'Add Random Events'}
            </button>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`${getDateRangeLabel(dateRange)}: ${formatDateRange(startDate, endDate)}`}
            color="primary"
            variant="filled"
            sx={{ fontWeight: 600, fontSize: '1rem', px: 2, py: 1, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="date-range-label">Time Period</InputLabel>
            <Select
              labelId="date-range-label"
              value={dateRange}
              label="Time Period"
              onChange={handleDateRangeChange}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="thismonth">This Month</MenuItem>
              <MenuItem value="thisyear">This Year</MenuItem>
              <MenuItem value="alltime">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #0052cc 0%, #00b8d9 100%)', color: '#fff', boxShadow: '0 4px 24px rgba(0,82,204,0.12)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" gutterBottom sx={{ opacity: 0.8 }}>
                    Total Events
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatNumber(summary.totalEvents)}
                  </Typography>
                </Box>
                <CalendarToday color="inherit" sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #00b8d9 0%, #36b37e 100%)', color: '#fff', boxShadow: '0 4px 24px rgba(0,184,217,0.12)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" gutterBottom sx={{ opacity: 0.8 }}>
                    Total Tokens
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatNumber(summary.totalTokens)}
                  </Typography>
                </Box>
                <Memory color="inherit" sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffab00 0%, #ff5630 100%)', color: '#fff', boxShadow: '0 4px 24px rgba(255,86,48,0.12)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" gutterBottom sx={{ opacity: 0.8 }}>
                    Total Cost
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(summary.totalCost)}
                  </Typography>
                </Box>
                <AttachMoney color="inherit" sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #36b37e 0%, #0052cc 100%)', color: '#fff', boxShadow: '0 4px 24px rgba(54,179,126,0.12)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" gutterBottom sx={{ opacity: 0.8 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(summary.totalRevenue)}
                  </Typography>
                </Box>
                <TrendingUp color="inherit" sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Usage Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    formatter={(value: any, name: string) => [
                      name === 'events' ? value : formatCurrency(value),
                      name === 'events' ? 'Events' : name === 'cost' ? 'Cost' : 'Revenue'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#0052cc" 
                    strokeWidth={3}
                    name="Events"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#36b37e" 
                    strokeWidth={3}
                    name="Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Usage by Vendor
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={vendorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value.toFixed(0)}%`}
                    outerRadius={80}
                    fill="#0052cc"
                    dataKey="value"
                  >
                    {vendorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value.toFixed(0)}%`, '']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* Usage by Model Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Usage by Model
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={modelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(0)}%`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#0052cc" strokeWidth={3} name="Percentage" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* Usage by API Type Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Usage by API Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={apiTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(0)}%`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#36b37e" strokeWidth={3} name="Percentage" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Cards */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Profitability
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  <strong>Total Profit:</strong> {formatCurrency(summary.totalProfit)}
                </Typography>
                <Typography variant="body1">
                  <strong>Profit Margin:</strong> {formatPercentage(summary.profitMargin)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Only show Top Customers for SUPERADMIN */}
        {user?.role === 'SUPERADMIN' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Top Customers
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {topCustomers.slice(0, 3).map((customer, index) => (
                    <Typography key={index} variant="body2">
                      {index + 1}. {customer.customerName}
                      <br />
                      <Typography component="span" color="textSecondary">
                        {formatCurrency(customer.totalCost)}  {customer.eventCount} events
                      </Typography>
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
