import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SignupPage from './pages/SignupPage';
import AddExpensePage from './pages/AddExpensePage';
import RequestPage from './pages/RequestPage';
import FixedExpensesPage from './pages/FixedExpensesPage';
import ExpenseHistoryPage from './pages/ExpenseHistoryPage';
import UserManagementPage from './pages/UserManagementPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/add-expense" element={<AddExpensePage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/fixed-expenses" element={<FixedExpensesPage />} />
        <Route path="/expense-history" element={<ExpenseHistoryPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
      </Routes>
    </Router>
  );
};

export default App;
