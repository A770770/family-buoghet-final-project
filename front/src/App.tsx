import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RequestPage from './pages/RequestPage';
import AddExpensePage from './pages/AddExpensePage';
import AddIncomePage from './pages/AddIncomePage';
import PrivateRoute from './components/PrivateRoute';
import SignupPage from './pages/SignupPage';
import FixedExpensesPage from './pages/FixedExpensesPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/requests" element={<RequestPage />} />
          <Route path="/expenses/add" element={<AddExpensePage />} />
          <Route path="/income/add" element={<AddIncomePage />} />
          <Route path="/expenses/fixed" element={<FixedExpensesPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
