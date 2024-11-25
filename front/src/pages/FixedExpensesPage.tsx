import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/FixedExpensesPage.css';
import { FaPlus, FaWater, FaBolt, FaWifi, FaHome, FaCar, FaPhone, FaCalendarAlt } from 'react-icons/fa';


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


const FixedExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    dueDate: ''
  });


  const categoryIcons: { [key: string]: { icon: JSX.Element; color: string } } = {
    'מים': { icon: <FaWater />, color: '#3498db' },
    'חשמל': { icon: <FaBolt />, color: '#f1c40f' },
    'אינטרנט': { icon: <FaWifi />, color: '#2ecc71' },
    'שכירות': { icon: <FaHome />, color: '#e74c3c' },
    'רכב': { icon: <FaCar />, color: '#9b59b6' },
    'טלפון': { icon: <FaPhone />, color: '#1abc9c' }
  };


  useEffect(() => {
    fetchFixedExpenses();
  }, []);


  const fetchFixedExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5004/api/expenses/fixed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching fixed expenses:', error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      // יצירת תאריך החיוב הבא
      const today = new Date();
      const dueDay = parseInt(newExpense.dueDate);
      const nextDate = new Date(today.getFullYear(), today.getMonth(), dueDay);

      // אם התאריך כבר עבר החודש, נקבע לחודש הבא
      if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }


      const expenseData = {
        amount: Number(newExpense.amount),
        category: newExpense.category,
        description: `הוצאה קבועה - ${newExpense.category}`,
        isRecurring: true,
        recurringDetails: {
          frequency: 'monthly',
          nextDate: nextDate
        }
      };

      await axios.post('http://localhost:5004/api/expenses/fixed', expenseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      fetchFixedExpenses();
      setShowAddForm(false);
      setNewExpense({ amount: '', category: '', dueDate: '' });
    } catch (error) {
      console.error('Error adding fixed expense:', error);
    }
  };


  const handleDelete = async (id: string) => {
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
    <div className="fixed-expenses-container">
      <header className="fixed-expenses-header">
        <h1>הוצאות קבועות</h1>
        <button
          className="add-expense-button"
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus /> הוספת הוצאה קבועה
        </button>
      </header>


      <div className="expenses-grid">
        {expenses.map(expense => (
          <div key={expense._id} className="expense-card">
            <div className="expense-icon" style={{ backgroundColor: categoryIcons[expense.category]?.color || '#ddd' }}>
              {categoryIcons[expense.category]?.icon || <FaHome />}
            </div>
            <div className="expense-details">
              <h3>{expense.category}</h3>
              <p className="amount">₪{expense.amount.toLocaleString()}</p>
              <p className="due-date">
                <FaCalendarAlt /> {new Date(expense.recurringDetails.nextDate).getDate()} לחודש
              </p>
            </div>
            <button
              className="delete-button"
              onClick={() => handleDelete(expense._id)}
              aria-label="מחק הוצאה"
            >
              ✕
            </button>
          </div>
        ))}
      </div>


      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-expense-modal">
            <h2>הוספת הוצאה קבועה</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>קטגוריה</label>
                <select
                  value={newExpense.category}
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                  required
                >
                  <option value="">בחר קטגוריה</option>
                  {Object.keys(categoryIcons).map(category => (
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
                  onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                  required
                  placeholder="הכנס סכום"
                />
              </div>


              <div className="form-group">
                <label>יום בחודש לתשלום</label>
                <div className="date-input-wrapper">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newExpense.dueDate}
                    onChange={e => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                    required
                    placeholder="בחר יום בחודש"
                  />
                  <FaCalendarAlt className="calendar-icon" />
                </div>
              </div>


              <div className="form-actions">
                <button type="submit" className="submit-button">הוסף הוצאה</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddForm(false)}
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
