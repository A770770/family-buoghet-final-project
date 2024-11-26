import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/DashboardPage.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaUser, FaSearch, FaBars, FaCog, FaSignOutAlt, FaHistory, FaPlusCircle, FaMoneyBillWave, FaPiggyBank } from 'react-icons/fa';
import { FiMenu, FiUser, FiLogOut, FiSettings, FiPieChart, FiDollarSign } from 'react-icons/fi';

interface DashboardData {
    currentBalance: number;
    totalExpenses: number;
    expensesByCategory: Array<{
        category: string;
        amount: number;
        isRecurring: boolean;
    }>;
    recentExpenses: Array<{
        _id: string;
        amount: number;
        category: string;
        description: string;
        date: string;
    }>;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9FA8DA'];

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userInfo, setUserInfo] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                if (!token || !userId) {
                    navigate('/login');
                    return;
                }
                const response = await axios.get(`http://localhost:5004/api/auth/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserInfo(response.data);
            } catch (error) {
                console.error('Error fetching user info:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                }
            }
        };

        fetchUserInfo();
    }, [navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                const response = await axios.get(
                    `http://localhost:5004/api/dashboard/getDashboardData/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('שגיאה בטעינת נתוני הדשבורד');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const filteredExpenses = data?.recentExpenses.filter(expense => 
        selectedCategory === 'all' || expense.category === selectedCategory
    ) || [];

    const categories = Array.from(
        new Set(data?.recentExpenses.map(expense => expense.category) || [])
    );

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    if (loading) return <div className="loading">טוען...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!data) return <div className="error">לא נמצאו נתונים</div>;

    const nonRecurringExpenses = data.expensesByCategory.filter(exp => !exp.isRecurring);
    const recurringExpenses = data.expensesByCategory.filter(exp => exp.isRecurring);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <div 
                        className="user-button" 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <FaUser size={24} />
                    </div>
                    {showUserMenu && (
                        <div 
                            className="user-menu"
                            onMouseLeave={() => setShowUserMenu(false)}
                        >
                            <div className="user-info">
                                <p><strong>שם:</strong> {userInfo?.username}</p>
                                <p><strong>אימייל:</strong> {userInfo?.email}</p>
                                <p>{userInfo?.role === 'parent' ? 'הורה' : 'ילד'}</p>
                            </div>
                            <button onClick={handleLogout} className="logout-button">
                                <FaSignOutAlt /> התנתק
                            </button>
                        </div>
                    )}
                </div>

                <h1>דשבורד משפחתי</h1>

                <div className="header-right">
                    <button 
                        className="hamburger-button" 
                        onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                    >
                        <FaBars size={24} />
                    </button>
                    {showHamburgerMenu && (
                        <div 
                            className="hamburger-menu"
                            onMouseLeave={() => setShowHamburgerMenu(false)}
                        >
                            <button 
                                onClick={() => {
                                    navigate('/expenses/add');
                                    setShowHamburgerMenu(false);
                                }}
                                className="add-expense"
                            >
                                <FaPlusCircle /> הוספת הוצאה
                            </button>
                            <button 
                                onClick={() => {
                                    navigate('/income/add');
                                    setShowHamburgerMenu(false);
                                }}
                                className="add-income"
                            >
                                <FaPiggyBank /> הוספת הכנסה
                            </button>
                            <button 
                                onClick={() => {
                                    navigate('/expenses/fixed');
                                    setShowHamburgerMenu(false);
                                }}
                                className="fixed-expenses"
                            >
                                <FaCog /> הוצאות קבועות
                            </button>
                            {userInfo?.role === 'parent' && (
                                <button 
                                    onClick={() => {
                                        navigate('/requests');
                                        setShowHamburgerMenu(false);
                                    }}
                                    className="requests"
                                >
                                    <FaMoneyBillWave /> בקשות ממתינות
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <div className="dashboard-stats">
                <div className="stat-card balance">
                    <h3>יתרה נוכחית</h3>
                    <p className={data.currentBalance < 0 ? 'negative' : 'positive'}>
                        ₪{data.currentBalance.toLocaleString()}
                    </p>
                </div>
                <div className="stat-card expenses">
                    <h3>סך הוצאות החודש</h3>
                    <p>₪{data.totalExpenses.toLocaleString()}</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-section">
                    <h3>הוצאות שוטפות</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={nonRecurringExpenses}
                                dataKey="amount"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ category, percent }) => 
                                    `${category} ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {nonRecurringExpenses.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-section">
                    <h3>הוצאות קבועות</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={recurringExpenses}
                                dataKey="amount"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ category, percent }) => 
                                    `${category} ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {recurringExpenses.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="recent-expenses-section">
                <div className="section-header">
                    <h3>הוצאות אחרונות</h3>
                    <div className="category-filter">
                        <FaSearch className="search-icon" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="category-select"
                        >
                            <option value="all">כל הקטגוריות</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="expenses-list">
                    {filteredExpenses.map((expense) => (
                        <div key={expense._id} className="expense-card">
                            <div className="expense-details">
                                <h4>{expense.description}</h4>
                                <p className="category">{expense.category}</p>
                            </div>
                            <div className="expense-amount">
                                ₪{expense.amount.toLocaleString()}
                            </div>
                            <div className="expense-date">
                                {new Date(expense.date).toLocaleDateString('he-IL')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
