import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoginPage from '../pages/LoginPage';

// Mock the modules we need
jest.mock('axios');
jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

// Mock window.localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    const renderLoginPage = () => {
        return render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );
    };

    // בדיקת הרנדור הראשוני של הדף
    test('renders login form correctly', () => {
        renderLoginPage();
        
        // בדיקת כותרת
        expect(screen.getByText('התחברות')).toBeInTheDocument();
        
        // בדיקת שדות הטופס
        expect(screen.getByPlaceholderText('אימייל')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('סיסמה')).toBeInTheDocument();
        
        // בדיקת כפתורים
        expect(screen.getByRole('button', { name: /התחבר/i })).toBeInTheDocument();
        expect(screen.getByText(/עבור למצב ילד/i)).toBeInTheDocument();
    });

    // בדיקת מעבר בין מצב הורה למצב ילד
    test('toggles between parent and child mode', () => {
        renderLoginPage();
        
        // בדיקת מצב התחלתי (הורה)
        expect(screen.getByPlaceholderText('אימייל')).toBeInTheDocument();
        
        // מעבר למצב ילד
        fireEvent.click(screen.getByText(/עבור למצב ילד/i));
        
        // בדיקה שהשדה אימייל נעלם
        expect(screen.queryByPlaceholderText('אימייל')).not.toBeInTheDocument();
        
        // מעבר חזרה למצב הורה
        fireEvent.click(screen.getByText(/עבור למצב הורה/i));
        
        // בדיקה שהשדה אימייל חזר
        expect(screen.getByPlaceholderText('אימייל')).toBeInTheDocument();
    });

    // בדיקת התחברות הורה מוצלחת
    test('successful parent login', async () => {
        const mockResponse = {
            data: {
                token: 'mock-token',
                user: {
                    id: 'user-id',
                    username: 'test-user',
                    role: 'parent',
                },
            },
        };
        (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        renderLoginPage();

        // מילוי פרטי התחברות
        fireEvent.change(screen.getByPlaceholderText('אימייל'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('סיסמה'), {
            target: { value: 'password123' },
        });

        // שליחת הטופס
        fireEvent.click(screen.getByRole('button', { name: /התחבר/i }));

        await waitFor(() => {
            // בדיקת קריאה ל-API
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:5004/api/auth/login',
                {
                    email: 'test@example.com',
                    password: 'password123',
                }
            );

            // בדיקת שמירה ב-localStorage
            expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
            expect(localStorage.setItem).toHaveBeenCalledWith('userId', 'user-id');
            expect(localStorage.setItem).toHaveBeenCalledWith('username', 'test-user');
            expect(localStorage.setItem).toHaveBeenCalledWith('role', 'parent');

            // בדיקת ניווט
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            
            // בדיקת הודעת הצלחה
            expect(toast.success).toHaveBeenCalledWith('התחברת בהצלחה!');
        });
    });

    // בדיקת התחברות ילד מוצלחת
    test('successful child login', async () => {
        const mockResponse = {
            data: {
                token: 'child-token',
                child: {
                    id: 'child-id',
                    name: 'test-child',
                    monthlyAllowance: 100,
                    remainingBudget: 50,
                },
            },
        };
        (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        renderLoginPage();

        // מעבר למצב ילד
        fireEvent.click(screen.getByText(/עבור למצב ילד/i));

        // הזנת סיסמה
        fireEvent.change(screen.getByPlaceholderText('סיסמה'), {
            target: { value: 'child-password' },
        });

        // שליחת הטופס
        fireEvent.click(screen.getByRole('button', { name: /התחבר/i }));

        await waitFor(() => {
            // בדיקת קריאה ל-API
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:5004/api/children/login',
                {
                    password: 'child-password',
                }
            );

            // בדיקת שמירה ב-localStorage
            expect(localStorage.setItem).toHaveBeenCalledWith('childToken', 'child-token');
            expect(localStorage.setItem).toHaveBeenCalledWith('childId', 'child-id');
            expect(localStorage.setItem).toHaveBeenCalledWith('childName', 'test-child');
            expect(localStorage.setItem).toHaveBeenCalledWith('role', 'child');

            // בדיקת ניווט
            expect(mockNavigate).toHaveBeenCalledWith('/child-dashboard');
            
            // בדיקת הודעת הצלחה
            expect(toast.success).toHaveBeenCalledWith('התחברת בהצלחה!');
        });
    });

    // בדיקת שגיאות התחברות
    test('handles login errors correctly', async () => {
        // דימוי שגיאת התחברות
        (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Login failed'));

        renderLoginPage();

        // ניסיון התחברות ללא אימייל
        fireEvent.click(screen.getByRole('button', { name: /התחבר/i }));
        expect(toast.error).toHaveBeenCalledWith('נא למלא את כל השדות');

        // ניסיון התחברות עם אימייל אך ללא סיסמה
        fireEvent.change(screen.getByPlaceholderText('אימייל'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.click(screen.getByRole('button', { name: /התחבר/i }));
        expect(toast.error).toHaveBeenCalledWith('נא להזין סיסמה');

        // ניסיון התחברות עם פרטים שגויים
        fireEvent.change(screen.getByPlaceholderText('סיסמה'), {
            target: { value: 'wrong-password' },
        });
        fireEvent.click(screen.getByRole('button', { name: /התחבר/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('שם משתמש או סיסמה שגויים');
        });
    });
});
