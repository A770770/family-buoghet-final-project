import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaChild, FaKey, FaCopy, FaWhatsapp, FaSms, FaEnvelope } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ChildrenManagementPage.css';

interface Child {
    _id: string;
    name: string;
    monthlyAllowance: number;
    remainingBudget: number;
}

const API_URL = 'http://localhost:5004';

const ChildrenManagementPage: React.FC = () => {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [budgetAmount, setBudgetAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [newChild, setNewChild] = useState({
        name: '',
        monthlyAllowance: 0
    });

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/children`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChildren(response.data);
        } catch (error) {
            console.error('Error fetching children:', error);
            toast.error('שגיאה בטעינת רשימת הילדים');
        }
    };

    const handleAddChild = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/children`, newChild, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChildren([...children, response.data.child]);
            setGeneratedPassword(response.data.password);
            setShowAddModal(false);
            setNewChild({ name: '', monthlyAllowance: 0 });
            toast.success('הילד נוסף בהצלחה!');
        } catch (error) {
            console.error('Error adding child:', error);
            toast.error('שגיאה בהוספת הילד');
        }
    };

    const handleShowPassword = async (childId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/children/${childId}/password`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const child = children.find(child => child._id === childId);
            if (child) {
                setSelectedChild(child);
                setGeneratedPassword(response.data.password);
                setShowPasswordModal(true);
            }
        } catch (error: any) {
            console.error('Error fetching password:', error);
            toast.error(error.response?.data?.message || 'שגיאה בטעינת הסיסמה');
        }
    };

    const handleDeleteChild = async (childId: string) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את הילד?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/api/children/${childId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChildren(children.filter(child => child._id !== childId));
                toast.success('הילד נמחק בהצלחה!');
            } catch (error) {
                console.error('Error deleting child:', error);
                toast.error('שגיאה במחיקת הילד');
            }
        }
    };

    const handleAddBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChild || !budgetAmount) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/children/${selectedChild._id}/add-budget`, {
                amount: parseFloat(budgetAmount)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            await fetchChildren();
            setShowBudgetModal(false);
            setBudgetAmount('');
            setSelectedChild(null);
            toast.success('התקציב עודכן בהצלחה');
        } catch (error) {
            console.error('Error adding budget:', error);
            toast.error('שגיאה בהוספת התקציב');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = (method: string, password: string) => {
        let shareUrl = '';
        const message = `הסיסמה שלך היא: ${password}`;
        
        switch (method) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                break;
            case 'sms':
                shareUrl = `sms:?body=${encodeURIComponent(message)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=הסיסמה שלך&body=${encodeURIComponent(message)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    };

    const openBudgetModal = (child: Child) => {
        setSelectedChild(child);
        setShowBudgetModal(true);
    };

    const closeBudgetModal = () => {
        setShowBudgetModal(false);
        setBudgetAmount('');
        setSelectedChild(null);
    };

    return (
        <div className="children-management-page">
            <div className="header">
                <h1>ניהול ילדים</h1>
                <button className="add-child-btn" onClick={() => setShowAddModal(true)}>
                    <FaPlus /> הוסף ילד
                </button>
            </div>
            
            <div className="children-list">
                {children.map(child => (
                    <div key={child._id} className="child-card">
                        <div className="child-header">
                            <div className="child-info">
                                <FaChild className="child-icon" />
                                <h3>{child.name}</h3>
                            </div>
                            <div className="child-actions">
                                <button 
                                    className="password-button"
                                    onClick={() => handleShowPassword(child._id)}
                                    title="הצג סיסמה"
                                >
                                    <FaKey />
                                </button>
                                <button 
                                    onClick={() => openBudgetModal(child)}
                                    className="add-budget-button"
                                >
                                    <FaPlus /> הוסף תקציב
                                </button>
                                <button 
                                    className="delete-button"
                                    onClick={() => handleDeleteChild(child._id)}
                                >
                                    מחק ילד
                                </button>
                            </div>
                        </div>
                        <div className="budget-info">
                            <p>תקציב חודשי: ₪{child.monthlyAllowance.toLocaleString()}</p>
                            <p>יתרה: ₪{child.remainingBudget.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* מודל הוספת ילד */}
            {showAddModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>הוספת ילד חדש</h2>
                        <div className="form-group">
                            <label>שם הילד:</label>
                            <input
                                type="text"
                                value={newChild.name}
                                onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>תקציב חודשי:</label>
                            <input
                                type="number"
                                value={newChild.monthlyAllowance}
                                onChange={(e) => setNewChild({ 
                                    ...newChild, 
                                    monthlyAllowance: Number(e.target.value) 
                                })}
                                required
                            />
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleAddChild} className="submit-button">
                                הוסף
                            </button>
                            <button 
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewChild({ name: '', monthlyAllowance: 0 });
                                }} 
                                className="cancel-button"
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* מודל הצגת סיסמה */}
            {showPasswordModal && selectedChild && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>הסיסמה של {selectedChild.name}</h2>
                        <div className="password-display">
                            <div className="password-text">{generatedPassword}</div>
                            <button 
                                className="copy-button"
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedPassword);
                                    toast.success('הסיסמה הועתקה ללוח');
                                }}
                            >
                                <FaCopy /> העתק
                            </button>
                        </div>
                        <div className="share-options">
                            <h3>שתף את הסיסמה דרך:</h3>
                            <div className="share-buttons">
                                <button onClick={() => handleShare('whatsapp', generatedPassword)}>
                                    <FaWhatsapp /> WhatsApp
                                </button>
                                <button onClick={() => handleShare('sms', generatedPassword)}>
                                    <FaSms /> SMS
                                </button>
                                <button onClick={() => handleShare('email', generatedPassword)}>
                                    <FaEnvelope /> Email
                                </button>
                            </div>
                        </div>
                        <button 
                            className="close-button" 
                            onClick={() => setShowPasswordModal(false)}
                        >
                            סגור
                        </button>
                    </div>
                </div>
            )}

            {/* מודל הוספת תקציב */}
            {showBudgetModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>הוספת תקציב ל{selectedChild?.name}</h2>
                        <form onSubmit={handleAddBudget}>
                            <div className="form-group">
                                <label>סכום:</label>
                                <input
                                    type="number"
                                    value={budgetAmount}
                                    onChange={(e) => setBudgetAmount(e.target.value)}
                                    placeholder="הכנס סכום"
                                    required
                                />
                            </div>
                            <div className="modal-buttons">
                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'מעדכן...' : 'הוסף תקציב'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={closeBudgetModal}
                                    disabled={loading}
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

export default ChildrenManagementPage;
