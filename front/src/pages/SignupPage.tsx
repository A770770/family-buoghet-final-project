// src/pages/SignupPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AxiosError } from 'axios';

interface SignupFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: 'parent' | 'child';
}

interface SignupResponse {
  token: string;
  user: {
    username: string;
    email: string;
    role: string;
  };
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    role: 'child' as 'parent' | 'child',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // קודם כל ננסה להירשם ישירות
      const response = await axiosInstance.post('/auth/signup', formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('userRole', response.data.user.role);

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'שגיאה בתהליך ההרשמה');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log(formData);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('נא להזין דוא"ל');
      return false;
    }
    if (!formData.username.trim()) {
      setError('נא להזין שם משתמש');
      return false;
    }
    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return false;
    }
    return true;
  };

  return (
    <div className="signup-container">
      <h1 className="text-2xl font-bold mb-6">הרשמה למערכת</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="דוא״ל"
            value={formData.email}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="שם משתמש"
            value={formData.username}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="סיסמה"
            value={formData.password}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="role-select"
          >
            <option value="parent">הורה</option>
            <option value="child">ילד</option>
          </select>
        </div>

        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? 'נרשם...' : 'הרשמה'}
        </button>

        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="secondary-button"
          >
            יש לך כבר חשבון? התחבר
          </button>
        </div>

        {error && <div className="message error">{error}</div>}
      </form>
    </div>
  );
};

export default SignupPage;
