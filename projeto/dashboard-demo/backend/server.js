const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/data', (req, res) => {
  const mockData = {
    metrics: {
      activeUsers: {
        value: 1247,
        change: +12.5,
        period: 'vs last month'
      },
      totalSales: {
        value: 89340,
        change: +8.2,
        period: 'vs last month'
      },
      openTickets: {
        value: 23,
        change: -15.4,
        period: 'vs last week'
      },
      revenue: {
        value: 234567,
        change: +18.7,
        period: 'vs last quarter'
      }
    },
    chartData: {
      sales: [
        { month: 'Jan', value: 12000 },
        { month: 'Feb', value: 15000 },
        { month: 'Mar', value: 18000 },
        { month: 'Apr', value: 14000 },
        { month: 'May', value: 22000 },
        { month: 'Jun', value: 25000 }
      ],
      userGrowth: [
        { month: 'Jan', users: 850 },
        { month: 'Feb', users: 920 },
        { month: 'Mar', users: 1050 },
        { month: 'Apr', users: 1180 },
        { month: 'May', users: 1200 },
        { month: 'Jun', users: 1247 }
      ]
    },
    recentActivity: [
      { id: 1, action: 'New user registration', time: '2 minutes ago', type: 'user' },
      { id: 2, action: 'Payment processed', time: '5 minutes ago', type: 'payment' },
      { id: 3, action: 'Support ticket closed', time: '12 minutes ago', type: 'support' },
      { id: 4, action: 'Product review submitted', time: '18 minutes ago', type: 'review' },
      { id: 5, action: 'New order placed', time: '25 minutes ago', type: 'order' }
    ]
  };

  res.json(mockData);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});