import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import '../styles/DashboardPage.css';
import { log } from 'console';

interface DashboardData {
  totalBudget: number;
  recentExpenses: Array<{
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
  }>;
  upcomingExpenses: Array<{
    id: string;
    title: string;
    amount: number;
    dueDate: string;
  }>;
  alerts: Array<{
    message: string;
    type: 'warning' | 'error' | 'info';
  }>;
  monthlyStats: {
    totalExpenses: number;
    totalIncome: number;
    expensesByCategory: Array<{
      category: string;
      amount: number;
    }>;
    dailyExpenses: Array<{
      date: string;
      amount: number;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: localStorage.getItem('username') || 'משתמש',
    role: localStorage.getItem('userRole'),
  });
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBudget: 0,
    recentExpenses: [],
    upcomingExpenses: [],
    alerts: [],
    monthlyStats: {
      totalExpenses: 0,
      totalIncome: 0,
      expensesByCategory: [],
      dailyExpenses: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      console.log({ token, userId });

      if (!token || !userId) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const dashboardResponse = await axios.get(
          `http://localhost:5004/api/dashboard/getDashboardData/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDashboardData(dashboardResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('שגיאה בטעינת הנתונים. אנא נסה שוב.');
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleAddExpense = () => {
    navigate('/add-expense');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">טוען...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>נסה שוב</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-welcome">
          <h1>שלום, {userData.username}</h1>
          <div className="user-actions">
            <button onClick={() => navigate(-1)} className="back-button">
              חזרה
            </button>
            <button onClick={handleLogout} className="logout-button">
              התנתק
            </button>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleAddExpense} className="add-expense-button">
            הוספת הוצאה +
          </button>
          {userData.role === 'parent' && (
            <button
              onClick={() => navigate('/requests')}
              className="requests-button"
            >
              בקשות ממתינות
            </button>
          )}
        </div>
      </header>

      {dashboardData.alerts.length > 0 && (
        <div className="alerts-section">
          {dashboardData.alerts.map((alert, index) => (
            <div key={index} className={`alert alert-${alert.type}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      <main className="dashboard-content">
        <section className="summary-cards">
          <div className="card total-budget">
            <h3>יתרה בקופה</h3>
            <div className="amount">
              {formatNumber(dashboardData.totalBudget)}
            </div>
            <div className="stats">
              <div className="income">
                <span>הכנסות החודש</span>
                <span>
                  {formatNumber(dashboardData.monthlyStats.totalIncome)}
                </span>
              </div>
              <div className="expenses">
                <span>הוצאות החודש</span>
                <span>
                  {formatNumber(dashboardData.monthlyStats.totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="charts-grid">
          <div className="card expenses-chart">
            <h3>הוצאות לאורך החודש</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.monthlyStats.dailyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  name="סכום"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card category-chart">
            <h3>התפלגות הוצאות לפי קטגוריה</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.monthlyStats.expensesByCategory}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {dashboardData.monthlyStats.expensesByCategory.map(
                    (_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="recent-expenses">
          <h3>הוצאות אחרונות</h3>
          <div className="expenses-list">
            {dashboardData.recentExpenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-details">
                  <span className="expense-title">{expense.title}</span>
                  <span className="expense-category">{expense.category}</span>
                </div>
                <span className="expense-amount">
                  {formatNumber(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
