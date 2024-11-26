import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWater, FaBolt, FaWifi, FaHome, FaCar, FaPhone, FaCalendarAlt, FaTrash, FaPlus } from 'react-icons/fa';
import '../styles/FixedExpensesPage.css';

interface FixedExpense {
  _id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  isRecurring: boolean;
  recurringDetails: {
    frequency: 'monthly';
    nextDate: Date;
  };
}

interface NewExpense {
  amount: string;
  category: string;
}

const FixedExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newExpense, setNewExpense] = useState<NewExpense>({
    amount: '',
    category: '',
  });

  const categoryIcons: { [key: string]: { icon: JSX.Element; color: string } } = {
    'מים': { icon: <FaWater size={20} />, color: '#3498db' },
    'חשמל': { icon: <FaBolt size={20} />, color: '#f1c40f' },
    'אינטרנט': { icon: <FaWifi size={20} />, color: '#2ecc71' },
    'שכירות': { icon: <FaHome size={20} />, color: '#e74c3c' },
    'רכב': { icon: <FaCar size={20} />, color: '#9b59b6' },
    'טלפון': { icon: <FaPhone size={20} />, color: '#1abc9c' }
  };

  useEffect(() => {
    fetchFixedExpenses();
  }, []);

  const fetchFixedExpenses = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<FixedExpense[]>('http://localhost:5004/api/expenses/fixed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching fixed expenses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const expenseData = {
        amount: Number(newExpense.amount),
        category: newExpense.category,
        description: `הוצאה קבועה - ${newExpense.category}`,
        isRecurring: true,
        recurringDetails: {
          frequency: 'monthly' as const,
          nextDate: new Date(selectedDate)
        }
      };

      await axios.post('http://localhost:5004/api/expenses/fixed', expenseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      fetchFixedExpenses();
      setShowModal(false);
      setNewExpense({ amount: '', category: '' });
      setSelectedDate('');
    } catch (error) {
      console.error('Error adding fixed expense:', error);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5004/api/expenses/fixed/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchFixedExpenses();
      } catch (error) {
        console.error('Error deleting fixed expense:', error);
      }
    }
  };

  return (
    <div dir="rtl" className="fixed-expenses-container">
      <div className="fixed-expenses-header">
        <h1>הוצאות קבועות</h1>
        <button className="add-button" onClick={() => setShowModal(true)}>
          <FaPlus /> הוספת הוצאה קבועה
        </button>
      </div>

      <div className="expenses-grid">
        {expenses.map((expense) => (
          <div key={expense._id} className="expense-card">
            <div className="expense-icon" style={{ backgroundColor: categoryIcons[expense.category]?.color + '20' }}>
              {categoryIcons[expense.category]?.icon}
            </div>
            <div className="expense-details">
              <h3>{expense.category}</h3>
              <p className="amount">₪{expense.amount.toLocaleString()}</p>
              <p className="due-date">
                <FaCalendarAlt /> חיוב ב-{expense.recurringDetails?.nextDate ? new Date(expense.recurringDetails.nextDate).getDate() : new Date().getDate()} לכל חודש
              </p>
            </div>
            <button
              className="delete-button"
              onClick={() => handleDelete(expense._id)}
              aria-label="מחק הוצאה"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>הוספת הוצאה קבועה</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>קטגוריה</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  required
                >
                  <option value="">בחר קטגוריה</option>
                  {Object.keys(categoryIcons).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>סכום</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  required
                  placeholder="הכנס סכום"
                />
              </div>

              <div className="form-group">
                <label>תאריך חיוב</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">הוסף הוצאה</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedExpensesPage;