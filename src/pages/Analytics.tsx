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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
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
  usageByRegion?: Record<string, number>;
  usageByEndpoint?: Record<string, number>;
  usageByUserRole?: Record<string, number>;
  timeSeriesData: Array<{
    date: string;
    events: number;
    cost: number;
    revenue: number;
    profit?: number;
  }>;
  topCustomers: Array<{
    customerName: string;
    totalCost: number;
    eventCount: number;
  }>;
  growthMetrics?: {
    eventsGrowth?: number;
    tokensGrowth?: number;
    costGrowth?: number;
    revenueGrowth?: number;
    profitGrowth?: number;
    comparisonPeriod?: string;
  };
  predictions?: {
    predictedEvents?: number;
    predictedTokens?: number;
    predictedCost?: number;
    predictedRevenue?: number;
    predictedProfit?: number;
  };
  efficiencyMetrics?: {
    costPerEvent?: number;
    revenuePerEvent?: number;
    profitPerEvent?: number;
    costPerToken?: number;
    revenuePerToken?: number;
    profitPerToken?: number;
  };
  seasonality?: {
    weeklyPattern?: Record<string, number>;
    monthlyPattern?: Record<string, number>;
  };
  anomalies?: Array<{
    date: string;
    type: string;
    metric: string;
    description: string;
  }>;
}

const Analytics: React.FC = () => {
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
        usageByRegion: data.usageByRegion || {},
        usageByEndpoint: data.usageByEndpoint || {},
        usageByUserRole: data.usageByUserRole || {},
        timeSeriesData: (data.timeSeriesData || []).map(item => ({
          date: item.date,
          events: item.events || 0,
          cost: item.cost || 0,
          revenue: item.revenue || 0,
          profit: item.profit || 0
        })),
        topCustomers: (data.topCustomers || []).map(customer => ({
          customerName: customer.organizationName || customer.customerId || 'Unknown',
          totalCost: customer.cost || 0,
          eventCount: customer.events || 0
        })),
        growthMetrics: data.growthMetrics || {},
        predictions: data.predictions || {},
        efficiencyMetrics: data.efficiencyMetrics || {},
        seasonality: data.seasonality || {},
        anomalies: data.anomalies || [],
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
          Loading analytics...
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

  const { summary, usageByVendor, usageByModel, usageByApiType, timeSeriesData, topCustomers, growthMetrics } = analyticsData;
  const { usageByRegion, usageByEndpoint, usageByUserRole, predictions, efficiencyMetrics, seasonality, anomalies } = analyticsData;
  const renderGrowth = (value?: number) => {
    if (value === undefined || value === null) return <span style={{ color: '#888' }}>N/A</span>;
    const isPositive = value >= 0;
    return (
      <span style={{ color: isPositive ? '#36b37e' : '#ff5630', fontWeight: 600 }}>
        {isPositive ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const vendorData = Object.entries(usageByVendor).map(([vendor, percentage]) => ({
    name: vendor,
    value: percentage
  }));

  const modelData = Object.entries(usageByModel).map(([model, percentage]) => ({
    name: model,
    value: percentage
  }));

  const apiTypeData = Object.entries(usageByApiType).map(([apiType, percentage]) => ({
    name: apiType,
    value: percentage
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-1px' }}>
          Analytics
        </Typography>
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
                    formatter={(value: any, name: string) => {
                      if (name === 'events') return [value, 'Events'];
                      if (name === 'cost') return [formatCurrency(value), 'Cost'];
                      if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                      return [value, name];
                    }}
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
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ffab00" 
                    strokeWidth={3}
                    name="Revenue"
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#0052cc"
                    dataKey="value"
                  >
                    {vendorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value, '']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Charts */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Usage by Model
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [value]} />
                  <Bar dataKey="value" fill="#0052cc" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Usage by API Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={apiTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}`]} />
                  <Bar dataKey="value" fill="#36b37e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deep-dive analytics cards and charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Profitability & Growth
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  <strong>Total Profit:</strong> {formatCurrency(summary.totalProfit)}
                </Typography>
                <Typography variant="body1">
                  <strong>Profit Margin:</strong> {formatPercentage(summary.profitMargin)}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Month-over-Month Growth:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                    <span><strong>Events:</strong> {renderGrowth(growthMetrics?.eventsGrowth)}</span>
                    <span><strong>Tokens:</strong> {renderGrowth(growthMetrics?.tokensGrowth)}</span>
                    <span><strong>Cost:</strong> {renderGrowth(growthMetrics?.costGrowth)}</span>
                    <span><strong>Revenue:</strong> {renderGrowth(growthMetrics?.revenueGrowth)}</span>
                    <span><strong>Profit:</strong> {renderGrowth(growthMetrics?.profitGrowth)}</span>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Predictions (Next Period):
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                    <span><strong>Events:</strong> {formatNumber(predictions?.predictedEvents)}</span>
                    <span><strong>Tokens:</strong> {formatNumber(predictions?.predictedTokens)}</span>
                    <span><strong>Cost:</strong> {formatCurrency(predictions?.predictedCost)}</span>
                    <span><strong>Revenue:</strong> {formatCurrency(predictions?.predictedRevenue)}</span>
                    <span><strong>Profit:</strong> {formatCurrency(predictions?.predictedProfit)}</span>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Efficiency Metrics:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                    <span><strong>Cost/Event:</strong> {formatCurrency(efficiencyMetrics?.costPerEvent)}</span>
                    <span><strong>Revenue/Event:</strong> {formatCurrency(efficiencyMetrics?.revenuePerEvent)}</span>
                    <span><strong>Profit/Event:</strong> {formatCurrency(efficiencyMetrics?.profitPerEvent)}</span>
                    <span><strong>Cost/Token:</strong> {formatCurrency(efficiencyMetrics?.costPerToken)}</span>
                    <span><strong>Revenue/Token:</strong> {formatCurrency(efficiencyMetrics?.revenuePerToken)}</span>
                    <span><strong>Profit/Token:</strong> {formatCurrency(efficiencyMetrics?.profitPerToken)}</span>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Anomalies & Seasonality
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Detected Anomalies:
                </Typography>
                {anomalies && anomalies.length > 0 ? (
                  anomalies.slice(0, 5).map((anomaly, idx) => (
                    <Typography key={idx} variant="body2" color={anomaly.type === 'spike' ? 'error' : 'primary'}>
                      {format(new Date(anomaly.date), 'MMM d, yyyy')}: {anomaly.description}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">No anomalies detected.</Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Weekly Pattern:
                  </Typography>
                  {seasonality?.weeklyPattern && Object.keys(seasonality.weeklyPattern).length > 0 ? (
                    Object.entries(seasonality.weeklyPattern).map(([day, avg], idx) => (
                      <Typography key={idx} variant="body2">{day}: {formatNumber(avg)}</Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">No weekly pattern data.</Typography>
                  )}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Monthly Pattern:
                  </Typography>
                  {seasonality?.monthlyPattern && Object.keys(seasonality.monthlyPattern).length > 0 ? (
                    Object.entries(seasonality.monthlyPattern).map(([month, avg], idx) => (
                      <Typography key={idx} variant="body2">{month}: {formatNumber(avg)}</Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">No monthly pattern data.</Typography>
                  )}
                </Box>
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
                  {topCustomers.slice(0, 5).map((customer, index) => (
                    <Typography key={index} variant="body2">
                      {index + 1}. {customer.customerName}
                      <br />
                      <Typography component="span" color="textSecondary">
                        {formatCurrency(customer.totalCost)} | {customer.eventCount} events
                      </Typography>
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        {/* New breakdown charts */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Usage by Region
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(usageByRegion || {}).map(([region, value]) => ({ name: region, value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}`, 'Events']} />
                  <Bar dataKey="value" fill="#8884D8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Usage by Endpoint
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(usageByEndpoint || {}).map(([endpoint, value]) => ({ name: endpoint, value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}`, 'Events']} />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Usage by User Role
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(usageByUserRole || {}).map(([role, value]) => ({ name: role, value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}`, 'Events']} />
                  <Bar dataKey="value" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
