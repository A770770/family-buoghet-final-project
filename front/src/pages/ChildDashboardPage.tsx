import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/ChildDashboardPage.css';
import { FaMoneyBillWave, FaPiggyBank, FaHistory, FaPlusCircle } from 'react-icons/fa';

interface Request {
    _id: string;
    amount: number;
    category: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    responseMessage?: string;
    createdAt: string;
    respondedAt?: string;
}

const ChildDashboardPage: React.FC = () => {
    const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
    const [remainingBudget, setRemainingBudget] = useState<number>(0);
    const [requests, setRequests] = useState<Request[]>([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [newRequest, setNewRequest] = useState({
        amount: '',
        category: '',
        description: ''
    });

    const categories = [
        'משחקים',
        'בגדים',
        'ממתקים',
        'צעצועים',
        'ספרים',
        'בילויים',
        'אחר'
    ];

    useEffect(() => {
        fetchChildData();
    }, []);

    const fetchChildData = async () => {
        try {
            const childId = localStorage.getItem('userId');
            const response = await axios.get(`/api/children/${childId}/data`);
            setMonthlyBudget(response.data.monthlyBudget);
            setRemainingBudget(response.data.remainingBudget);
            setRequests(response.data.requests);
        } catch (error) {
            console.error('Error fetching child data:', error);
            toast.error('שגיאה בטעינת הנתונים');
        }
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const childId = localStorage.getItem('userId');
            await axios.post(`/api/children/${childId}/requests`, {
                amount: parseFloat(newRequest.amount),
                category: newRequest.category,
                description: newRequest.description
            });

            setShowRequestModal(false);
            setNewRequest({ amount: '', category: '', description: '' });
            toast.success('הבקשה נשלחה בהצלחה');
            fetchChildData();
        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('שגיאה בשליחת הבקשה');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'var(--success-color)';
            case 'rejected': return 'var(--error-color)';
            default: return 'var(--warning-color)';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'אושר';
            case 'rejected': return 'נדחה';
            default: return 'ממתין';
        }
    };

    return (
        <div className="child-dashboard">
            <div className="dashboard-header">
                <h1>שלום!</h1>
                <button className="new-request-button" onClick={() => setShowRequestModal(true)}>
                    <FaPlusCircle /> בקשה חדשה
                </button>
            </div>

            <div className="budget-cards">
                <div className="budget-card">
                    <FaMoneyBillWave className="card-icon" />
                    <div className="card-content">
                        <h3>תקציב חודשי</h3>
                        <p>₪{monthlyBudget}</p>
                    </div>
                </div>
                <div className="budget-card">
                    <FaPiggyBank className="card-icon" />
                    <div className="card-content">
                        <h3>נשאר בתקציב</h3>
                        <p>₪{remainingBudget}</p>
                    </div>
                </div>
            </div>

            <div className="requests-section">
                <h2><FaHistory /> הבקשות שלי</h2>
                <div className="requests-list">
                    {requests.map(request => (
                        <div key={request._id} className="request-card">
                            <div className="request-header">
                                <span className="request-category">{request.category}</span>
                                <span className="request-date">
                                    {new Date(request.createdAt).toLocaleDateString('he-IL')}
                                </span>
                            </div>
                            <p className="request-description">{request.description}</p>
                            <p className="request-amount">₪{request.amount}</p>
                            <div className="request-status" style={{ color: getStatusColor(request.status) }}>
                                {getStatusText(request.status)}
                            </div>
                            {request.responseMessage && (
                                <p className="response-message">
                                    הודעה מההורה: {request.responseMessage}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {showRequestModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>בקשה חדשה</h2>
                        <form onSubmit={handleRequestSubmit}>
                            <div className="form-group">
                                <label>סכום</label>
                                <input
                                    type="number"
                                    value={newRequest.amount}
                                    onChange={(e) => setNewRequest({
                                        ...newRequest,
                                        amount: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>קטגוריה</label>
                                <select
                                    value={newRequest.category}
                                    onChange={(e) => setNewRequest({
                                        ...newRequest,
                                        category: e.target.value
                                    })}
                                    required
                                >
                                    <option value="">בחר קטגוריה</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>תיאור</label>
                                <textarea
                                    value={newRequest.description}
                                    onChange={(e) => setNewRequest({
                                        ...newRequest,
                                        description: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit">שלח בקשה</button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowRequestModal(false)}
                                    className="cancel-button"
                                >
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
