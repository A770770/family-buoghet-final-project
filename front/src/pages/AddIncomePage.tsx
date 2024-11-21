import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AddIncomePage.css';

const AddIncomePage: React.FC = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('משכורת');
    const [description, setDescription] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                navigate('/login');
                return;
            }

            const response = await axios.post('http://localhost:5004/api/income', {
                amount: parseFloat(amount),
                source,
                description,
                userId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                try {
                    // רענון הדשבורד
                    await axios.get(`http://localhost:5004/api/dashboard/refreshDashboard/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                    // המתנה קצרה לפני הניווט
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    navigate('/dashboard', { 
                        state: { 
                            refresh: true,
                            newIncome: response.data.income,
                            budgetStatus: response.data.budgetStatus
                        } 
                    });
                } catch (refreshError) {
                    console.error('Error refreshing dashboard:', refreshError);
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error('Error adding income:', error);
            // הוספת הודעת שגיאה למשתמש
            alert('שגיאה בהוספת ההכנסה. אנא נסה שוב.');
        }
    };

    return (
        <div className="add-income-container">
            <header>
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    חזרה לדף הבית
                </button>
                <h1>הוספת הכנסה</h1>
            </header>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="amount">סכום:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="source">מקור:</label>
                    <select
                        id="source"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                    >
                        <option value="משכורת">משכורת</option>
                        <option value="מתנה">מתנה</option>
                        <option value="השקעות">השקעות</option>
                        <option value="אחר">אחר</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="description">תיאור:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <button type="submit" className="submit-button">הוסף הכנסה</button>
            </form>
        </div>
    );
};

export default AddIncomePage; 