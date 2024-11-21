import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/RegisterPage.css';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'parent' as 'parent' | 'child',
        parentEmail: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5004/api/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                parentEmail: formData.role === 'child' ? formData.parentEmail : undefined
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                localStorage.setItem('username', response.data.username);
                localStorage.setItem('userRole', response.data.role);
                navigate('/dashboard');
            }
        } catch (error: any) {
            setError(error.response?.data?.error || 'שגיאה בהרשמה');
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>הרשמה</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>שם משתמש:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

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

                    <div className="form-group">
                        <label>אימות סיסמה:</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>סוג משתמש:</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="parent">הורה</option>
                            <option value="child">ילד</option>
                        </select>
                    </div>

                    {formData.role === 'child' && (
                        <div className="form-group">
                            <label>אימייל ההורה:</label>
                            <input
                                type="email"
                                name="parentEmail"
                                value={formData.parentEmail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="register-button">הרשמה</button>
                </form>

                <div className="login-link">
                    <p>כבר יש לך חשבון?</p>
                    <button onClick={() => navigate('/login')} className="link-button">
                        התחבר כאן
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage; 