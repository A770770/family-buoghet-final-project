import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/AddIncomePage.css';
import { FaHome, FaMoneyBillWave, FaShekelSign } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const AddIncomePage: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [moneySymbols, setMoneySymbols] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const symbols = Array.from({ length: 20 }, (_, index) => ({
      id: index,
      left: Math.random() * 100, // מיקום אופקי באחוזים
      delay: Math.random() * 10 // עיכוב התחלתי באנימציה
    }));
    setMoneySymbols(symbols);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !source || !description) {
      toast.warning('נא למלא את כל השדות');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('נא להזין סכום חיובי');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        toast.error('אנא התחבר מחדש למערכת');
        navigate('/login');
        return;
      }

      await axios.post('http://localhost:5004/api/income', {
        amount: numericAmount,
        source,
        description,
        userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('ההכנסה נוספה בהצלחה!');
      setShowConfetti(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Error adding income:', error);
      toast.error(error.response?.data?.message || 'שגיאה בהוספת ההכנסה. אנא נסה שוב.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="add-income-container">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
      
      <div className="money-background">
        {moneySymbols.map((symbol) => (
          <div
            key={symbol.id}
            className="money-symbol"
            style={{
              left: `${symbol.left}%`,
              animationDelay: `${symbol.delay}s`
            }}
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
          backgroundColor: '#2196f3',
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="income-form-container"
      >
        <motion.div 
          className="form-header"
          variants={itemVariants}
        >
          <FaMoneyBillWave className="money-icon" size={40} />
          <h2>הוספת הכנסה חדשה</h2>
        </motion.div>
        
        <motion.form onSubmit={handleSubmit}>
          <motion.div className="form-group" variants={itemVariants}>
            <label>סכום:</label>
            <div className="input-wrapper">
              <motion.input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="הכנס סכום"
                required
                whileFocus={{ scale: 1.02, boxShadow: '0 0 8px rgba(33, 150, 243, 0.4)' }}
              />
              <span className="currency-symbol">₪</span>
            </div>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label>מקור:</label>
            <div className="select-wrapper">
              <motion.select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
                whileFocus={{ scale: 1.02, boxShadow: '0 0 8px rgba(33, 150, 243, 0.4)' }}
              >
                <option value="">בחר מקור</option>
                <option value="salary">משכורת</option>
                <option value="bonus">בונוס</option>
                <option value="gift">מתנה</option>
                <option value="other">אחר</option>
              </motion.select>
              <div className="category-icon">
                <FaMoneyBillWave />
              </div>
            </div>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label>תיאור:</label>
            <motion.textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="הכנס תיאור"
              required
              whileFocus={{ scale: 1.02, boxShadow: '0 0 8px rgba(33, 150, 243, 0.4)' }}
            />
          </motion.div>

          <motion.div className="form-actions" variants={itemVariants}>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="submit-button"
            >
              הוסף הכנסה
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cancel-button"
            >
              ביטול
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AddIncomePage;