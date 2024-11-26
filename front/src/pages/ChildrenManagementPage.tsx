import React, { useState, useEffect } from 'react';
import { FaPlus, FaChild, FaKey, FaCopy, FaWhatsapp, FaSms, FaEnvelope } from 'react-icons/fa';
import { PieChart } from 'react-minimal-pie-chart';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/ChildrenManagementPage.css';

interface Child {
    _id: string;
    name: string;
    monthlyAllowance: number;
    remainingBudget: number;
    expenses: Array<{
        amount: number;
        category: string;
        description: string;
        date: string;
    }>;
}

interface ExpensesByCategory {
    [key: string]: number;
}

const ChildrenManagementPage: React.FC = () => {
    const [children, setChildren] = useState<Child[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newChild, setNewChild] = useState({
        name: '',
        monthlyAllowance: 0
    });
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5004/api/children', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChildren(response.data);
        } catch (error) {
            console.error('Error fetching children:', error);
            toast.error('שגיאה בטעינת נתוני הילדים');
        }
    };

    const handleAddChild = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5004/api/children', newChild, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChildren([...children, response.data.child]);
            setGeneratedPassword(response.data.password);
            setShowAddModal(false);
            setNewChild({ name: '', monthlyAllowance: 0 });
            toast.success('הילד נוסף בהצלחה! הסיסמה היא: ' + response.data.password);
        } catch (error) {
            console.error('Error adding child:', error);
            toast.error('שגיאה בהוספת הילד');
        }
    };

    const handleCopyPassword = (password: string) => {
        navigator.clipboard.writeText(password);
        toast.success('הסיסמה הועתקה ללוח');
    };

    const handleShare = async (password: string, method: 'whatsapp' | 'sms' | 'email') => {
        const message = `הסיסמה שלך למערכת ניהול התקציב היא: ${password}`;
        
        switch (method) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
                break;
            case 'sms':
                window.open(`sms:?&body=${encodeURIComponent(message)}`);
                break;
            case 'email':
                window.open(`mailto:?subject=הסיסמה שלך למערכת ניהול התקציב&body=${encodeURIComponent(message)}`);
                break;
        }
    };

    const handleShowPassword = async (childId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5004/api/children/${childId}/password`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedChild(children.find(child => child._id === childId) || null);
            setShowPasswordModal(true);
            setGeneratedPassword(response.data.password);
        } catch (error) {
            console.error('Error fetching password:', error);
            toast.error('שגיאה בטעינת הסיסמה');
        }
    };

    const calculateExpensesByCategory = (expenses: Child['expenses']): ExpensesByCategory => {
        return expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as ExpensesByCategory);
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    return (
        <div className="children-management-page" dir="rtl">
            <div className="header">
                <h1>ניהול ילדים</h1>
                <button className="add-button" onClick={() => setShowAddModal(true)}>
                    <FaPlus /> הוסף ילד
                </button>
            </div>

            <div className="children-grid">
                {children.map((child) => (
                    <div key={child._id} className="child-card">
                        <div className="child-header">
                            <div className="child-info">
                                <FaChild className="child-icon" />
                                <h2>{child.name}</h2>
                            </div>
                            <button 
                                className="password-button"
                                onClick={() => handleShowPassword(child._id)}
                                title="הצג סיסמה"
                            >
                                <FaKey />
                            </button>
                        </div>
                        <div className="budget-info">
                            <p>תקציב חודשי: ₪{child.monthlyAllowance.toLocaleString()}</p>
                            <p>נותר: ₪{child.remainingBudget.toLocaleString()}</p>
                        </div>
                        <div className="expenses-chart">
                            {child.expenses.length > 0 ? (
                                <>
                                    <PieChart
                                        data={Object.entries(calculateExpensesByCategory(child.expenses)).map(([category, amount]) => ({
                                            title: category,
                                            value: amount,
                                            color: getRandomColor()
                                        }))}
                                        lineWidth={20}
                                        paddingAngle={2}
                                        labelStyle={{
                                            fontSize: '5px',
                                            fontFamily: 'sans-serif'
                                        }}
                                        label={({ dataEntry }) => 
                                            `${dataEntry.title} (₪${dataEntry.value.toLocaleString()})`
                                        }
                                        labelPosition={75}
                                    />
                                    <div className="chart-legend">
                                        {Object.entries(calculateExpensesByCategory(child.expenses)).map(([category, amount]) => (
                                            <div key={category} className="legend-item">
                                                <span className="color-box" style={{ backgroundColor: getRandomColor() }}></span>
                                                <span>{category}: ₪{amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="no-expenses">אין הוצאות להצגה</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

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
                            <button onClick={() => {
                                setShowAddModal(false);
                                setNewChild({ name: '', monthlyAllowance: 0 });
                            }} className="cancel-button">
                                ביטול
                            </button>
                        </div>
                        {generatedPassword && (
                            <div className="password-display">
                                <p>סיסמת הילד היא: <strong>{generatedPassword}</strong></p>
                                <p className="password-note">שמור את הסיסמה במקום בטוח!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {showPasswordModal && selectedChild && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>הסיסמה של {selectedChild.name}</h2>
                        <div className="password-display">
                            <p className="password-value">{generatedPassword}</p>
                            <div className="password-actions">
                                <button onClick={() => handleCopyPassword(generatedPassword)}>
                                    <FaCopy /> העתק
                                </button>
                                <button onClick={() => handleShare(generatedPassword, 'whatsapp')}>
                                    <FaWhatsapp /> שתף בווצאפ
                                </button>
                                <button onClick={() => handleShare(generatedPassword, 'sms')}>
                                    <FaSms /> שתף בהודעה
                                </button>
                                <button onClick={() => handleShare(generatedPassword, 'email')}>
                                    <FaEnvelope /> שתף באימייל
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPasswordModal(false)}
                            className="close-button"
                        >
                            סגור
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChildrenManagementPage;
