import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AddExpensePage.css';

const AddExpensePage: React.FC = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            await axios.post('http://localhost:5004/api/expenses', {
                amount: parseFloat(amount),
                category,
                description,
                userId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // רענון הדשבורד
            await axios.get(
                `http://localhost:5004/api/dashboard/refreshDashboard/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate('/dashboard');
        } catch (error: any) {
            setError(error.response?.data?.error || 'שגיאה בהוספת ההוצאה');
        }
    };

    return (
        <div className="add-expense-container">
            <h2>הוספת הוצאה חדשה</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>סכום:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>קטגוריה:</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">בחר קטגוריה</option>
                        <option value="מזון">מזון</option>
                        <option value="תחבורה">תחבורה</option>
                        <option value="בילויים">בילויים</option>
                        <option value="קניות">קניות</option>
                        <option value="חינוך">חינוך</option>
                        <option value="בריאות">בריאות</option>
                        <option value="ביגוד">ביגוד</option>
                        <option value="אחר">אחר</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>תיאור:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="buttons-container">
                    <button type="submit">הוסף הוצאה</button>
                    <button type="button" onClick={() => navigate('/dashboard')}>
                        ביטול
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddExpensePage;