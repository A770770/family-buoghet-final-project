import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/DashboardPage.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaUser, FaSearch, FaBars, FaCog, FaSignOutAlt, FaHistory, FaPlusCircle, FaMoneyBillWave, FaPiggyBank, FaChild, FaLightbulb, FaUtensils, FaShoppingCart, FaCar, FaGamepad, FaGift, FaTshirt } from 'react-icons/fa';
import { FiMenu, FiUser, FiLogOut, FiSettings, FiPieChart, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';

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

const COLORS = [
    '#2193b0',  // כחול
    '#ee0979',  // ורוד
    '#4CA1AF',  // טורקיז
    '#ff4b1f',  // כתום
    '#56CCF2',  // תכלת
    '#6dd5ed',  // כחול בהיר
    '#ff6a00',  // כתום בהיר
    '#C4E0E5',  // תכלת בהיר
    '#ff9068',  // סלמון
    '#2F80ED'   // כחול כהה
];

const getGradientColors = (index: number) => {
    const startColor = COLORS[index % 5];
    const endColor = COLORS[(index % 5) + 5];
    return { startColor, endColor };
};

const savingTips = [
    "💡 טיפ: הגדר תקציב חודשי ועקוב אחריו בקפידה",
    "💰 טיפ: שים לב להוצאות הקטנות - הן מצטברות!",
    "🎯 טיפ: הגדר יעדי חיסכון ברורים",
    "🏦 טיפ: בדוק את דמי הניהול בחשבון הבנק שלך",
    "🛒 טיפ: ערוך רשימת קניות לפני שאתה יוצא לקניות",
    "💳 טיפ: הימנע משימוש בכרטיס אשראי לרכישות קטנות",
    "📊 טיפ: עקוב אחר ההוצאות השוטפות שלך באופן קבוע",
    "🏠 טיפ: בדוק אפשרויות לחסוך בהוצאות הקבועות כמו חשמל ומים"
];

// מיפוי קטגוריות לעברית עם צבעים
const FIXED_EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'שכר דירה', color: '#FF6B6B', icon: '🏠' },
  { value: 'mortgage', label: 'משכנתא', color: '#FF6B6B', icon: '🏦' },
  { value: 'building_maintenance', label: 'ועד בית ותחזוקה', color: '#4ECDC4', icon: '🔧' },
  { value: 'electricity', label: 'חשמל', color: '#FFE66D', icon: '⚡' },
  { value: 'water', label: 'מים', color: '#45B7D1', icon: '💧' },
  { value: 'property_tax', label: 'ארנונה', color: '#96CEB4', icon: '📑' },
  { value: 'gas', label: 'גז', color: '#D4A5A5', icon: '🔥' },
  { value: 'utilities', label: 'חשבונות שוטפים', color: '#9B97B2', icon: '📊' },
  { value: 'phone', label: 'טלפון נייד', color: '#77DD77', icon: '📱' },
  { value: 'internet', label: 'אינטרנט וטלוויזיה', color: '#836FFF', icon: '🌐' },
  { value: 'car_insurance', label: 'ביטוח רכב', color: '#FF9999', icon: '🚗' },
  { value: 'health_insurance', label: 'ביטוח בריאות', color: '#FF99CC', icon: '⚕️' },
  { value: 'life_insurance', label: 'ביטוח חיים', color: '#99CCFF', icon: '🏥' },
  { value: 'home_insurance', label: 'ביטוח דירה', color: '#99FF99', icon: '🏡' },
  { value: 'car_loan', label: 'תשלום רכב', color: '#FFB366', icon: '🚘' },
  { value: 'personal_loan', label: 'הלוואה אישית', color: '#FF99FF', icon: '💰' },
  { value: 'gym', label: 'חדר כושר וספורט', color: '#FF9966', icon: '🏋️' },
  { value: 'subscriptions', label: 'מנויים דיגיטליים', color: '#9999FF', icon: '📱' },
  { value: 'clubs', label: 'חוגים ופנאי', color: '#FFCC99', icon: '🎨' },
  { value: 'education', label: 'חינוך ולימודים', color: '#99FFCC', icon: '📚' },
  { value: 'daycare', label: 'מעון/צהרון', color: '#FF99CC', icon: '👶' },
  { value: 'other', label: 'הוצאות קבועות אחרות', color: '#B8B8B8', icon: '📌' },
  // הוצאות רגילות
  { value: 'food', label: 'מזון', color: '#FF6B6B', icon: '🍽️' },
  { value: 'shopping', label: 'קניות', color: '#4ECDC4', icon: '🛍️' },
  { value: 'transportation', label: 'תחבורה', color: '#FFE66D', icon: '🚌' },
  { value: 'entertainment', label: 'בידור', color: '#45B7D1', icon: '🎭' },
  { value: 'gifts', label: 'מתנות', color: '#96CEB4', icon: '🎁' },
  { value: 'clothing', label: 'ביגוד', color: '#D4A5A5', icon: '👕' }
];

const getCategoryLabel = (category: string): string => {
  return FIXED_EXPENSE_CATEGORIES.find(cat => cat.value === category)?.label || category;
};

const getCategoryIcon = (category: string): string => {
  return FIXED_EXPENSE_CATEGORIES.find(cat => cat.value === category)?.icon || '📌';
};

const getCategoryColor = (category: string): string => {
  return FIXED_EXPENSE_CATEGORIES.find(cat => cat.value === category)?.color || '#B8B8B8';
};

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
    const [showConfetti, setShowConfetti] = useState(false);
    const [currentTip, setCurrentTip] = useState('');
    const [showTip, setShowTip] = useState(false);
    const [tipState, setTipState] = useState<'entering' | 'showing' | 'exiting'>('entering');

    // אנימציה למספרים
    const numberProps = useSpring({
        from: { val: 0 },
        to: { val: data?.currentBalance || 0 },
        config: { duration: 1000 }
    });

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
                if (!token || !userId) {
                    navigate('/login');
                    return;
                }
                const response = await axios.get(
                    `http://localhost:5004/api/dashboard/getDashboardData/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                } else {
                    setError('שגיאה בטעינת נתוני הדשבורד');
                }
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        // הצגת קונפטי בכניסה ראשונית
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);

        // בחירת טיפ רנדומלי והצגתו
        const randomTip = savingTips[Math.floor(Math.random() * savingTips.length)];
        setCurrentTip(randomTip);
        setShowTip(true);
        setTipState('entering');

        // החלפת טיפים כל 10 שניות
        const tipInterval = setInterval(() => {
            setTipState('exiting');
            setTimeout(() => {
                const newTip = savingTips[Math.floor(Math.random() * savingTips.length)];
                setCurrentTip(newTip);
                setTipState('entering');
            }, 500);
        }, 10000);

        return () => clearInterval(tipInterval);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleCloseTip = () => {
        setTipState('exiting');
        setTimeout(() => {
            setShowTip(false);
        }, 500);
    };

    // איחוד כל הקטגוריות מההוצאות הקבועות והרגילות
    const allCategories = Array.from(
        new Set([
            ...(data?.expensesByCategory?.filter(exp => !exp.isRecurring).map(exp => exp.category) || []),
            ...(data?.expensesByCategory?.filter(exp => exp.isRecurring).map(exp => exp.category) || [])
        ])
    );

    const filteredExpenses = data?.recentExpenses?.filter(expense => 
        selectedCategory === 'all' || expense.category === selectedCategory
    ) || [];

    const nonRecurringExpenses = data?.expensesByCategory?.filter(exp => !exp.isRecurring) || [];
    const recurringExpenses = data?.expensesByCategory?.filter(exp => exp.isRecurring) || [];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    if (loading) return <div className="loading">טוען...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!data) return <div className="error">לא נמצאו נתונים</div>;

    return (
        <div className="dashboard-container">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
            
            <AnimatePresence>
                {showTip && (
                    <motion.div 
                        className="saving-tip"
                        data-state={tipState}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                        }}
                    >
                        <button className="close-tip-button" onClick={handleCloseTip}>
                            ✕
                        </button>
                        <FaLightbulb className="tip-icon" />
                        <span>{currentTip}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                className="dashboard-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
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
                        aria-label="תפריט"
                    >
                        <FaBars />
                    </button>
                    {showHamburgerMenu && (
                        <div 
                            className="hamburger-menu"
                            onMouseLeave={() => setShowHamburgerMenu(false)}
                        >
                            <div className="menu-items">
                                <Link to="/expenses/add" className="menu-item add-expense" onClick={() => setShowHamburgerMenu(false)}>
                                    <FaPlusCircle /> הוספת הוצאה
                                </Link>
                                <Link to="/income/add" className="menu-item add-income" onClick={() => setShowHamburgerMenu(false)}>
                                    <FaPiggyBank /> הוספת הכנסה
                                </Link>
                                <div className="menu-divider" />
                                <Link to="/expenses/fixed" className="menu-item fixed-expenses" onClick={() => setShowHamburgerMenu(false)}>
                                    <FaCog /> הוצאות קבועות
                                </Link>
                                {userInfo?.role === 'parent' && (
                                    <>
                                        <Link to="/children" className="menu-item children" onClick={() => setShowHamburgerMenu(false)}>
                                            <FaChild /> ניהול ילדים
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <motion.div 
                className="dashboard-stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="stat-card current-balance">
                    <h3>יתרה נוכחית</h3>
                    <div className="balance-amount">
                        <span>₪</span>
                        <span>{data.currentBalance.toLocaleString()}</span>
                    </div>
                </div>

                <div className="stat-card expenses">
                    <h3>סך הוצאות החודש</h3>
                    <p>₪{data.totalExpenses.toLocaleString()}</p>
                </div>
            </motion.div>

            <div className="charts-container">
                <div className="chart-section pie-chart">
                    <h3>הוצאות שוטפות</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <defs>
                                {nonRecurringExpenses?.map((_, index) => (
                                    <linearGradient
                                        key={`gradient-${index}`}
                                        id={`gradient-${index}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor={getGradientColors(index).startColor}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor={getGradientColors(index).endColor}
                                        />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={nonRecurringExpenses.map(expense => ({
                                    ...expense,
                                    category: getCategoryLabel(expense.category)
                                }))}
                                dataKey="amount"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={160}
                                paddingAngle={5}
                                label={({ name, percent }) => 
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={true}
                            >
                                {nonRecurringExpenses?.map((_, index) => (
                                    <Cell 
                                        key={`cell-${index}`}
                                        fill={`url(#gradient-${index})`}
                                    />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => `₪${value.toLocaleString()}`}
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-total">
                        <span>סה״כ הוצאות שוטפות:</span>
                        <span className="total-amount">
                            ₪{nonRecurringExpenses?.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="chart-section pie-chart">
                    <h3>הוצאות קבועות</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <defs>
                                {recurringExpenses?.map((_, index) => (
                                    <linearGradient
                                        key={`gradient-recurring-${index}`}
                                        id={`gradient-recurring-${index}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor={getGradientColors(index + 5).startColor}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor={getGradientColors(index + 5).endColor}
                                        />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={recurringExpenses.map(expense => ({
                                    ...expense,
                                    category: getCategoryLabel(expense.category)
                                }))}
                                dataKey="amount"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={160}
                                paddingAngle={5}
                                label={({ name, percent }) => 
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={true}
                            >
                                {recurringExpenses?.map((_, index) => (
                                    <Cell 
                                        key={`cell-recurring-${index}`}
                                        fill={`url(#gradient-recurring-${index})`}
                                    />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => `₪${value.toLocaleString()}`}
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-total">
                        <span>סה״כ הוצאות קבועות:</span>
                        <span className="total-amount">
                            ₪{recurringExpenses?.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
                        </span>
                    </div>
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
                            {allCategories.map(category => (
                                <option key={category} value={category}>
                                    {getCategoryLabel(category)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="expenses-list">
                    {filteredExpenses.map((expense) => (
                        <div 
                            key={expense._id} 
                            className="expense-card"
                            style={{ 
                                borderRight: `4px solid ${getCategoryColor(expense.category)}`,
                            }}
                        >
                            <div className="expense-icon">
                                {getCategoryIcon(expense.category)}
                            </div>
                            <div className="expense-details">
                                <h4>{expense.description || 'הוצאה'}</h4>
                                <p className="category" style={{ color: getCategoryColor(expense.category) }}>
                                    {getCategoryLabel(expense.category)}
                                </p>
                            </div>
                            <div className="expense-amount">
                                ₪{expense.amount.toLocaleString()}
                            </div>
                            <div className="expense-date">
                                {new Date(expense.date).toLocaleDateString('he-IL')}
                            </div>
                        </div>
                    ))}
                    {filteredExpenses.length === 0 && (
                        <div className="no-expenses">
                            <p>לא נמצאו הוצאות בקטגוריה זו</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
