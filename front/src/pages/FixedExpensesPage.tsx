import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaPlus, FaClock, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/FixedExpensesPage.css';

interface FixedExpense {
  _id: string;
  category: string;
  amount: number;
  description: string;
  isRecurring: boolean;
  recurringDetails: {
    frequency: string;
    nextDate: string;
  };
}

interface NewExpense {
  category: string;
  amount: string | number;
  recurringDetails: {
    frequency: string;
    nextDate: string;
  };
}

const FIXED_EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'שכר דירה' },
  { value: 'mortgage', label: 'משכנתא' },
  { value: 'utilities', label: 'חשבונות' },
  { value: 'insurance', label: 'ביטוח' },
  { value: 'phone', label: 'טלפון' },
  { value: 'internet', label: 'אינטרנט' },
  { value: 'car', label: 'רכב' },
  { value: 'other', label: 'אחר' }
];

export const FixedExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();
  
  const [newExpense, setNewExpense] = useState<NewExpense>({
    category: '',
    amount: '',
    recurringDetails: {
      frequency: 'monthly',
      nextDate: ''
    }
  });

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('אנא התחבר מחדש למערכת');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5004/api/expenses/fixed', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // מיון ההוצאות לפי תאריך התשלום הבא
      const sortedExpenses = response.data.sort((a: FixedExpense, b: FixedExpense) => 
        new Date(a.recurringDetails.nextDate).getTime() - new Date(b.recurringDetails.nextDate).getTime()
      );

      setExpenses(sortedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('שגיאה בטעינת ההוצאות הקבועות');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !selectedDate) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('אנא התחבר מחדש למערכת');
        return;
      }

      const numericAmount = parseFloat(newExpense.amount.toString());
      if (isNaN(numericAmount) || numericAmount <= 0) {
        toast.error('נא להזין סכום תקין');
        return;
      }

      const selectedDateTime = new Date(selectedDate);
      if (isNaN(selectedDateTime.getTime())) {
        toast.error('נא להזין תאריך תקין');
        return;
      }

      const expenseData = {
        amount: numericAmount,
        category: newExpense.category,
        description: `הוצאה קבועה - ${FIXED_EXPENSE_CATEGORIES.find(cat => cat.value === newExpense.category)?.label}`,
        isRecurring: true,
        recurringDetails: {
          frequency: newExpense.recurringDetails.frequency,
          nextDate: selectedDateTime.toISOString().split('T')[0]
        }
      };

      console.log('שולח נתוני הוצאה:', expenseData);

      const response = await axios.post('http://localhost:5004/api/expenses/fixed', expenseData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('תגובת השרת:', response.data);
      
      toast.success('ההוצאה הקבועה נוספה בהצלחה');
      setShowModal(false);
      setNewExpense({
        category: '',
        amount: '',
        recurringDetails: {
          frequency: 'monthly',
          nextDate: ''
        }
      });
      setSelectedDate('');
      fetchExpenses();
    } catch (error: any) {
      console.error('שגיאה בהוספת הוצאה:', error);
      console.error('פרטי שגיאת שרת:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'שגיאה בהוספת ההוצאה הקבועה';
      toast.error(errorMessage);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('אנא התחבר מחדש למערכת');
        return;
      }

      await axios.delete(`http://localhost:5004/api/expenses/fixed/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('ההוצאה נמחקה בהצלחה');
      fetchExpenses();
    } catch (error) {
      console.error('שגיאה במחיקת הוצאה:', error);
      toast.error('שגיאה במחיקת ההוצאה');
    }
  };

  const getNextPaymentDate = (frequency: string, currentDate: Date) => {
    const nextDate = new Date(currentDate);
    
    switch (frequency) {
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'bimonthly':
        nextDate.setMonth(nextDate.getMonth() + 2);
        break;
      default:
        console.warn('תדירות לא מוכרת:', frequency);
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    // וידוא שהתאריך תקין
    if (nextDate.toString() === 'Invalid Date') {
      console.error('נוצר תאריך לא תקין:', { frequency, currentDate, nextDate });
      return new Date().toISOString().split('T')[0];
    }

    return nextDate.toISOString().split('T')[0];
  };

  const getFrequencyText = (frequency: string): string => {
    switch (frequency) {
      case 'monthly':
        return 'חודשי';
      case 'bimonthly':
        return 'דו-חודשי';
      default:
        return 'לא ידוע';
    }
  };

  const formatDate = (date: string) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        console.error('תאריך לא תקין:', date);
        return 'תאריך לא תקין';
      }
      return d.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('שגיאה בפורמט תאריך:', error);
      return 'תאריך לא תקין';
    }
  };

  return (
    <div className="fixed-expenses-container">
      <div className="fixed-expenses-header">
        <h1>הוצאות קבועות</h1>
        <button className="home-button" onClick={() => navigate('/')}>
          <FaHome />
        </button>
      </div>

      <button className="add-expense-button" onClick={() => setShowModal(true)}>
        <FaPlus />
        הוסף הוצאה קבועה
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>הוספת הוצאה קבועה</h2>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            >
              <option value="">בחר קטגוריה</option>
              {FIXED_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="סכום"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            />

            <select
              value={newExpense.recurringDetails.frequency}
              onChange={(e) => setNewExpense({
                ...newExpense,
                recurringDetails: {
                  ...newExpense.recurringDetails,
                  frequency: e.target.value
                }
              })}
            >
              <option value="monthly">חודשי</option>
              <option value="bimonthly">דו-חודשי</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <div className="modal-buttons">
              <button onClick={handleAddExpense}>הוסף</button>
              <button onClick={() => setShowModal(false)}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      <motion.div 
        className="expenses-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {expenses.map((expense) => (
          <motion.div
            key={expense._id}
            className="expense-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="expense-header">
              <div className="expense-icon">
                <FaClock />
              </div>
              <div className="expense-title">
                <h3>{FIXED_EXPENSE_CATEGORIES.find(cat => cat.value === expense.category)?.label}</h3>
                <p className="expense-amount">₪{expense.amount.toLocaleString()}</p>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDeleteExpense(expense._id)}
              >
                <FaTrash />
              </button>
            </div>
            <div className="expense-details">
              <div className="frequency-badge">
                <FaClock />
                {getFrequencyText(expense.recurringDetails.frequency)}
              </div>
              <p className="next-payment">
                <FaCalendarAlt />
                תשלום הבא: {formatDate(expense.recurringDetails.nextDate)}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FixedExpensesPage;