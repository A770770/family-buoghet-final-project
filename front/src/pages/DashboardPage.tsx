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
import { RecentExpenses } from '../components/RecentExpenses';
import { UpcomingExpenses } from '../components/UpcomingExpenses';
import { DashboardData, ExpenseCategory } from '../types/dashboard';
import { FaCog } from 'react-icons/fa';
import HamburgerMenu from '../components/HamburgerMenu';
import { FixedExpensesDashboard } from '../components/FixedExpensesDashboard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: localStorage.getItem('username') || 'משתמש',
    role: localStorage.getItem('userRole'),
  });
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentBalance: 0,
    totalExpenses: 0,
    expensesByCategory: [],
    recentExpenses: [],
    upcomingExpenses: [],
    alerts: [],
    pendingRequests: {
      count: 0,
      items: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');

        // מביא את כל הנתונים לדשבורד
        const dashboardResponse = await axios.get(
          `http://localhost:5004/api/dashboard/getDashboardData/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // מסנן את ההוצאות הקבועות מהדשבורד הראשי
        const filteredExpenses = dashboardResponse.data.expensesByCategory.filter(
          (expense: ExpenseCategory) => !expense.isRecurring
        );

        setDashboardData({
          ...dashboardResponse.data,
          expensesByCategory: filteredExpenses
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('שגיאה בטעינת הנתונים. אנא נסה שוב.');
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

  const handleNavigate = (path: string) => {
    navigate(path);
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
        <HamburgerMenu userRole={userData.role} />
        <div className="user-welcome">
          <h1>שלום, {userData.username}</h1>
          <div className="user-actions">
            <button onClick={() => navigate('/expenses/fixed')} className="nav-button">
              <FaCog /> ניהול הוצאות קבועות
            </button>
            <button onClick={() => navigate('/expenses/history')} className="nav-button">
              היסטוריית הוצאות
            </button>
            <button onClick={() => navigate('/expenses/add')} className="nav-button">
              הוספת הוצאה
            </button>
            {userData.role === 'parent' && (
              <button 
                onClick={() => handleNavigate('/pending-requests')}
                className="nav-button"
              >
                בקשות ממתינות
              </button>
            )}
            {userData.role === 'child' && (
              <button 
                onClick={() => handleNavigate('/request')}
                className="nav-button"
              >
                בקשת כסף חדשה
              </button>
            )}
            <button onClick={handleLogout} className="logout-button">
              התנתק
            </button>
          </div>
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
            <div className="budget-header">
              <h3>יתרה בקופה</h3>
              <button onClick={() => navigate('/income/add')} className="add-income-button">
                הוספת הכנסה חודשית +
              </button>
            </div>
            <div className="amount">
              {formatNumber(dashboardData.currentBalance)}
            </div>
            <div className="stats">
              <div className="balance">
                <span>יתרה בקופה</span>
                <span>{formatNumber(dashboardData.currentBalance)}</span>
              </div>
              <div className="expenses">
                <span>הוצאות החודש</span>
                <span>{formatNumber(dashboardData.totalExpenses)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="expenses-overview">
          <h2 className="section-title">סיכום הוצאות חודשי</h2>
          <div className="pie-charts-container">
            <div className="card category-chart">
              <h3>הוצאות שוטפות החודש</h3>
              <div className="chart-description">
                הוצאות שוטפות כמו קניות בסופר, בילויים, וקניות שונות מתוך ההכנסה החודשית
              </div>
              <div className="chart-amount">
                סה"כ: {formatNumber(dashboardData.expensesByCategory.reduce((sum, exp) => sum + exp.amount, 0))}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.expensesByCategory}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={(entry) => `${entry.category}: ${formatNumber(entry.amount)}`}
                  >
                    {dashboardData.expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card category-chart">
              <FixedExpensesDashboard />
            </div>
          </div>
        </section>

        <section className="recent-activity">
          <h2 className="section-title">פעילות אחרונה</h2>
          <div className="card">
            <RecentExpenses expenses={dashboardData.recentExpenses} />
          </div>
        </section>

        <section className="upcoming-expenses">
          <h2 className="section-title">הוצאות עתידיות</h2>
          <div className="card">
            {dashboardData.upcomingExpenses?.length > 0 ? (
              <UpcomingExpenses expenses={dashboardData.upcomingExpenses} />
            ) : (
              <p className="no-data">אין הוצאות עתידיות</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
