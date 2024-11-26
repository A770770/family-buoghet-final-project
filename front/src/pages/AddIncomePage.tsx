import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AddIncomePage.css';

const AddIncomePage: React.FC = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            await axios.post('http://localhost:5004/api/income', {
                amount: parseFloat(amount),
                source,
                description,
                userId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // נווט ישירות לדשבורד - הוא יתרענן אוטומטית
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error adding income:', error);
            setError('שגיאה בהוספת ההכנסה. אנא נסה שוב.');
        }
    };

    return (
        <div className="add-income-container">
            <h2>הוספת הכנסה חדשה</h2>
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
                    <label>מקור:</label>
                    <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        required
                    >
                        <option value="">בחר מקור</option>
                        <option value="salary">משכורת</option>
                        <option value="bonus">בונוס</option>
                        <option value="gift">מתנה</option>
                        <option value="other">אחר</option>
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
                    <button type="submit">הוסף הכנסה</button>
                    <button type="button" onClick={() => navigate('/dashboard')}>
                        ביטול
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddIncomePage;