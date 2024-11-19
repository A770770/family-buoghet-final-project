import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.email || !formData.password) {
            setError('נא למלא את כל השדות');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5004/api/auth/login', formData);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('username', response.data.user.username);
            localStorage.setItem('userRole', response.data.user.role);
            
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'שגיאה בהתחברות');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h1>התחברות</h1>
                
                <div className="form-group">
                    <label>דוא"ל</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="הכנס דוא״ל"
                    />
                </div>

                <div className="form-group">
                    <label>סיסמה</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="הכנס סיסמה"
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'מתחבר...' : 'התחבר'}
                </button>

                <div className="form-links">
                    <button type="button" onClick={() => navigate('/signup')} className="link-button">
                        הרשמה למערכת
                    </button>
                    <button type="button" onClick={() => navigate('/forgot-password')} className="link-button">
                        שכחתי סיסמה
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;