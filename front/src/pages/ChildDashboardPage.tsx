import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaPiggyBank, FaHistory, FaPlusCircle, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaComment, FaFileAlt } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ChildDashboardPage.css';

interface Request {
    id: string;
    amount: number;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    responseMessage?: string;
    category: string;
}

interface ChildData {
    name: string;
    monthlyAllowance: number;
    remainingBudget: number;
}

const API_URL = 'http://localhost:5004';

const savingTips = [
    'שים לב לכמה כסף אתה מוציא על ממתקים - אולי כדאי לחסוך קצת?',
    'נסה לחסוך 10% מדמי הכיס שלך כל חודש',
    'לפני שאתה קונה משהו, חכה יום אחד וחשוב אם אתה באמת צריך את זה',
    'השווה מחירים לפני שאתה קונה',
    'נסה להרוויח כסף נוסף בעזרת עבודות קטנות בבית'
];

const categories = ['משחקים', 'בגדים', 'ממתקים', 'צעצועים', 'ספרים', 'בילויים', 'אחר'];

const ChildDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [childData, setChildData] = useState<ChildData | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [requestAmount, setRequestAmount] = useState('');
    const [requestDescription, setRequestDescription] = useState('');
    const [requestCategory, setRequestCategory] = useState(categories[0]);
    const [loading, setLoading] = useState(false);
    const [currentTip, setCurrentTip] = useState('');
    const [showRequestModal, setShowRequestModal] = useState(false);

    useEffect(() => {
        setCurrentTip(savingTips[Math.floor(Math.random() * savingTips.length)]);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('childToken');
        const childId = localStorage.getItem('childId');

        if (!token || !childId) {
            navigate('/login');
            return;
        }

        fetchChildData(childId, token);
        fetchRequests(childId, token);
    }, [navigate]);

    const fetchChildData = async (childId: string, token: string) => {
        try {
            const response = await axios.get(`${API_URL}/api/children/${childId}/data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChildData(response.data);
        } catch (error) {
            console.error('Error fetching child data:', error);
            toast.error('שגיאה בטעינת הנתונים');
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('childToken');
                localStorage.removeItem('childId');
                navigate('/login');
            }
        }
    };

    const fetchRequests = async (childId: string, token: string) => {
        try {
            const response = await axios.get(`${API_URL}/api/children/${childId}/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('childToken');
                localStorage.removeItem('childId');
                navigate('/login');
            }
        }
    };

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestAmount || !requestDescription || !requestCategory) {
            toast.error('נא למלא את כל השדות');
            return;
        }

        const childId = localStorage.getItem('childId');
        const token = localStorage.getItem('childToken');

        if (!childId || !token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/children/${childId}/requests`, {
                amount: parseFloat(requestAmount),
                description: requestDescription,
                category: requestCategory
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('הבקשה נשלחה בהצלחה');
            setRequestAmount('');
            setRequestDescription('');
            setShowRequestModal(false);
            
            // רענון הנתונים אחרי שליחת הבקשה
            await fetchChildData(childId, token);
            await fetchRequests(childId, token);
        } catch (error) {
            console.error('Error submitting request:', error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'שגיאה בשליחת הבקשה');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <FaCheckCircle className="status-icon approved" />;
            case 'rejected':
                return <FaTimesCircle className="status-icon rejected" />;
            default:
                return <FaHourglassHalf className="status-icon pending" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return 'אושר';
            case 'rejected':
                return 'נדחה';
            default:
                return 'ממתין לאישור';
        }
    };

    if (!childData) {
        return <div className="loading" key="loading">טוען...</div>;
    }

    return (
        <div className="child-dashboard-container" key="dashboard-container">
            <div className="dashboard-hero" key="dashboard-hero">
                <div className="hero-content" key="hero-content">
                    <h1 key="welcome-message">שלום {childData.name}! 👋</h1>
                    <div className="daily-tip" key="daily-tip">
                        <div className="tip-bubble" key="tip-bubble">
                            <FaPiggyBank className="tip-icon" />
                            <p key="tip-text">{currentTip}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stats-grid" key="stats-grid">
                <div className="stat-card" key="monthly-allowance">
                    <div className="stat-icon" key="monthly-allowance-icon">
                        <FaMoneyBillWave />
                    </div>
                    <div className="stat-info" key="monthly-allowance-info">
                        <h3 key="monthly-allowance-title">תקציב חודשי</h3>
                        <p className="stat-value" key="monthly-allowance-value">₪{childData.monthlyAllowance.toLocaleString()}</p>
                        <div className="stat-progress" key="monthly-allowance-progress">
                            <div 
                                className="progress-bar" 
                                style={{ 
                                    width: `${Math.min(100, (childData.remainingBudget / childData.monthlyAllowance) * 100)}%` 
                                }}
                                key="monthly-allowance-progress-bar"
                            />
                        </div>
                    </div>
                </div>

                <div className="stat-card" key="remaining-budget">
                    <div className="stat-icon" key="remaining-budget-icon">
                        <FaPiggyBank />
                    </div>
                    <div className="stat-info" key="remaining-budget-info">
                        <h3 key="remaining-budget-title">נשאר בתקציב</h3>
                        <p className="stat-value" key="remaining-budget-value">₪{childData.remainingBudget.toLocaleString()}</p>
                        <p className="stat-subtitle" key="remaining-budget-subtitle">
                            {childData.remainingBudget > 0 ? 
                                '🌟 מצוין! אתה חוסך יפה' : 
                                '💡 אולי כדאי לחסוך קצת?'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="recent-activity" key="recent-activity">
                <div className="section-title" key="section-title">
                    <FaHistory className="section-icon" />
                    <h2 key="section-title-text">הבקשות האחרונות שלי</h2>
                    <button 
                        className="new-request-btn"
                        onClick={() => setShowRequestModal(true)}
                        key="new-request-btn"
                    >
                        <FaPlusCircle /> בקשה חדשה
                    </button>
                </div>

                <div className="activity-cards" key="activity-cards">
                    {requests.map((request) => (
                        <div key={request.id} className={`activity-card ${request.status}`}>
                            <div className="request-header" key={`${request.id}-header`}>
                                {request.status === 'pending' && (
                                    <div className="status-badge pending" key={`${request.id}-pending-badge`}>
                                        <FaHourglassHalf /> ממתין לאישור
                                    </div>
                                )}
                                {request.status === 'approved' && (
                                    <div className="status-badge approved" key={`${request.id}-approved-badge`}>
                                        <FaCheckCircle /> אושר
                                    </div>
                                )}
                                {request.status === 'rejected' && (
                                    <div className="status-badge rejected" key={`${request.id}-rejected-badge`}>
                                        <FaTimesCircle /> נדחה
                                    </div>
                                )}
                                <span className="request-date" key={`${request.id}-date`}>
                                    {new Date(request.createdAt).toLocaleDateString('he-IL')}
                                </span>
                            </div>
                            <div className="request-amount" key={`${request.id}-amount`}>₪{request.amount.toLocaleString()}</div>
                            <div className="request-category" key={`${request.id}-category`}>
                                <span className="category-tag" key={`${request.id}-category-tag`}>{request.category}</span>
                            </div>
                            <p className="request-description" key={`${request.id}-description`}>{request.description}</p>
                            {request.responseMessage && (
                                <div className="response-message" key={`${request.id}-response`}>
                                    <FaComment className="message-icon" />
                                    {request.responseMessage}
                                </div>
                            )}
                        </div>
                    ))}
                    {(!requests || requests.length === 0) && (
                        <div className="empty-state" key="empty-state">
                            <FaFileAlt className="empty-icon" />
                            <p key="empty-state-text">עדיין אין לך בקשות</p>
                            <button 
                                className="create-first-btn"
                                onClick={() => setShowRequestModal(true)}
                                key="create-first-btn"
                            >
                                צור בקשה ראשונה
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showRequestModal && (
                <div className="modal" key="modal">
                    <div className="modal-content" key="modal-content">
                        <h2 key="modal-title">בקשה חדשה</h2>
                        <form onSubmit={handleSubmitRequest} key="request-form">
                            <div className="form-group" key="amount-group">
                                <label key="amount-label">סכום (₪)</label>
                                <input
                                    type="number"
                                    value={requestAmount}
                                    onChange={(e) => setRequestAmount(e.target.value)}
                                    min="0"
                                    required
                                    key="amount-input"
                                />
                            </div>
                            <div className="form-group" key="category-group">
                                <label key="category-label">קטגוריה</label>
                                <select
                                    value={requestCategory}
                                    onChange={(e) => setRequestCategory(e.target.value)}
                                    required
                                    key="category-select"
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" key="description-group">
                                <label key="description-label">תיאור</label>
                                <textarea
                                    value={requestDescription}
                                    onChange={(e) => setRequestDescription(e.target.value)}
                                    required
                                    key="description-textarea"
                                />
                            </div>
                            <div className="modal-buttons" key="modal-buttons">
                                <button type="submit" disabled={loading} key="submit-btn">
                                    {loading ? 'שולח...' : 'שלח בקשה'}
                                </button>
                                <button type="button" onClick={() => setShowRequestModal(false)} key="cancel-btn">
                                    ביטול
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChildDashboardPage;
