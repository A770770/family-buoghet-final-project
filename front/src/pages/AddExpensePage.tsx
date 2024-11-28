import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/AddExpensePage.css';
import { FaHome, FaMoneyBillWave, FaShekelSign, FaShoppingCart, FaUtensils, FaCar, FaGamepad, FaGift, FaTshirt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'מזון', icon: <FaUtensils /> },
  { value: 'shopping', label: 'קניות', icon: <FaShoppingCart /> },
  { value: 'transportation', label: 'תחבורה', icon: <FaCar /> },
  { value: 'entertainment', label: 'בידור', icon: <FaGamepad /> },
  { value: 'gifts', label: 'מתנות', icon: <FaGift /> },
  { value: 'clothing', label: 'ביגוד', icon: <FaTshirt /> },
  { value: 'other', label: 'אחר', icon: <FaMoneyBillWave /> },
];

const AddExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [coins, setCoins] = useState<Array<{ id: number; style: { left: string; animationDuration: string } }>>([]);

  useEffect(() => {
    // יצירת מטבעות נופלים
    const newCoins = Array.from({ length: 15 }, (_, index) => ({
      id: index,
      style: {
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 5}s`,
      },
    }));
    setCoins(newCoins);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !description) {
      toast.warning('נא למלא את כל השדות');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('אנא התחבר מחדש למערכת');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:5004/api/expenses',
        {
          amount: parseFloat(amount),
          category,
          description,
          date: new Date()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success('ההוצאה נוספה בהצלחה!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error adding expense:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'אירעה שגיאה בהוספת ההוצאה';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="add-expense-container">
      <div className="expense-coins">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="coin"
            style={coin.style}
          >
            <FaShekelSign />
          </div>
        ))}
      </div>

      <motion.button
        onClick={() => navigate('/dashboard')}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#ff416c',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaHome size={24} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="expense-form-container"
      >
        <motion.div 
          className="form-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FaMoneyBillWave className="expense-icon" size={40} />
          <h2>הוספת הוצאה חדשה</h2>
        </motion.div>
        
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label>סכום:</label>
            <div className="amount-input-wrapper">
              <motion.input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="הכנס סכום"
                required
                whileFocus={{ scale: 1.02 }}
              />
            </div>
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label>קטגוריה:</label>
            <motion.select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">בחר קטגוריה</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </motion.select>
            {category && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="category-icon"
              >
                {EXPENSE_CATEGORIES.find(cat => cat.value === category)?.icon}
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label>תיאור:</label>
            <motion.textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="הוסף תיאור להוצאה"
              required
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>

          <motion.div 
            className="form-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              type="submit"
              className="submit-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              הוסף הוצאה
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="cancel-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ביטול
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AddExpensePage;