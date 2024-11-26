import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.email || !formData.password) {
            toast.warning('נא למלא את כל השדות');
            setLoading(false);
            return;
        }

        // וידוא שהאימייל תקין
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('נא להזין כתובת דוא"ל תקינה');
            setLoading(false);
            return;
        }

        try {
            const loginData = {
                email: formData.email.toLowerCase(),
                password: formData.password
            };
            
            const response = await axios.post('http://localhost:5004/api/auth/login', loginData);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('username', response.data.user.username);
            localStorage.setItem('userRole', response.data.user.role);
            
            toast.success('התחברת בהצלחה!');
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.response?.status === 401) {
                toast.error('אימייל או סיסמה שגויים');
            } else {
                toast.error('שגיאה בהתחברות, נסה שוב מאוחר יותר');
            }
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>התחברות</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>אימייל:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>סיסמה:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'מתחבר...' : 'התחבר'}
                    </button>
                </form>

                <div className="register-link">
                    <p>אין לך חשבון? <span onClick={() => navigate('/signup')}>הירשם כאן</span></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;