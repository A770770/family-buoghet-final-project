import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SignupPage from './pages/SignupPage';
import AddExpensePage from './pages/AddExpensePage';
import RequestPage from './pages/RequestPage';
import FixedExpensesPage from './pages/FixedExpensesPage';
import ExpenseHistoryPage from './pages/ExpenseHistoryPage';
import UserManagementPage from './pages/UserManagementPage';
import AddIncomePage from './pages/AddIncomePage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expenses/add" element={<AddExpensePage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/expenses/fixed" element={<FixedExpensesPage />} />
        <Route path="/expense-history" element={<ExpenseHistoryPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/expenses/history" element={<ExpenseHistoryPage />} />
        <Route path="/expenses/fixed" element={<FixedExpensesPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/income/add" element={<AddIncomePage />} />


      </Routes>
    </Router>
  );
};

export default App;
