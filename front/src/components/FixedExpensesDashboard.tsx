import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import '../styles/FixedExpensesDashboard.css';

interface FixedExpense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  recurringDetails: {
    frequency: 'monthly';
    nextDate: Date;
  };
}

interface CategoryTotal {
  category: string; // שם הקטגוריה בעברית
  amount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

// מיפוי הקטגוריות לעברית
const FIXED_EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'שכר דירה' },
  { value: 'mortgage', label: 'משכנתא' },
  { value: 'building_maintenance', label: 'ועד בית ותחזוקה' },
  { value: 'electricity', label: 'חשמל' },
  { value: 'water', label: 'מים' },
  { value: 'property_tax', label: 'ארנונה' },
  { value: 'gas', label: 'גז' },
  { value: 'phone', label: 'טלפון נייד' },
  { value: 'internet', label: 'אינטרנט וטלוויזיה' },
  { value: 'car_insurance', label: 'ביטוח רכב' },
  { value: 'health_insurance', label: 'ביטוח בריאות' },
  { value: 'life_insurance', label: 'ביטוח חיים' },
  { value: 'home_insurance', label: 'ביטוח דירה' },
  { value: 'car_loan', label: 'תשלום רכב' },
  { value: 'personal_loan', label: 'הלוואה אישית' },
  { value: 'gym', label: 'חדר כושר וספורט' },
  { value: 'subscriptions', label: 'מנויים דיגיטליים' },
  { value: 'clubs', label: 'חוגים ופנאי' },
  { value: 'education', label: 'חינוך ולימודים' },
  { value: 'daycare', label: 'מעון/צהרון' },
  { value: 'other', label: 'הוצאות קבועות אחרות' },
];

// מיפוי הקטגוריות לאובייקטים בעברית
const getCategoryLabel = (category: string): string => {
  return FIXED_EXPENSE_CATEGORIES.find(cat => cat.value === category)?.label || category;
};


export const FixedExpensesDashboard: React.FC = () => {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);

  useEffect(() => {
    const fetchFixedExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<FixedExpense[]>('http://localhost:5004/api/expenses/fixed', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFixedExpenses(response.data);

        // חישוב סכום כולל
        const total = response.data.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalAmount(total);

        // חישוב סכומים לפי קטגוריה בעברית
        const categoryMap = new Map<string, number>();
        response.data.forEach((expense) => {
          const hebrewCategory = getCategoryLabel(expense.category); // תרגום הקטגוריה לעברית
          const currentAmount = categoryMap.get(hebrewCategory) || 0;
          categoryMap.set(hebrewCategory, currentAmount + expense.amount);
        });
        

        const totals = Array.from(categoryMap.entries()).map(([category, amount]) => ({
          category, // שם בעברית
          amount,
        }));

        setCategoryTotals(totals);
      } catch (error) {
        console.error('שגיאה בטעינת הוצאות קבועות:', error);
      }
    };

    fetchFixedExpenses();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="fixed-expenses-dashboard">
      <div className="dashboard-header">
        <h3>הוצאות קבועות לחודש הבא</h3>
        <div className="chart-description">
          כאן תוכל לראות את ההוצאות הקבועות שלך (כמו שכר דירה, חשמל) שצריך לשמור עבורן כסף לסוף החודש
        </div>
        <div className="total-amount">סכום לשמור: {formatNumber(totalAmount)}</div>
      </div>
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          {categoryTotals.length ? (
            <PieChart>
              <Pie
                data={categoryTotals}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={160}
                fill="#8884d8"
                label={({ name }) => name}
              >
                {categoryTotals.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatNumber(value)}
                labelFormatter={(name) => name}
              />
            </PieChart>
          ) : (
            <div>אין נתונים להציג</div>
          )}
        </ResponsiveContainer>
      </div>

      <div className="recent-expenses">
        <h3>הוצאות אחרונות</h3>
        <div className="expenses-list">
          {fixedExpenses.slice(0, 5).map((expense) => (
            <div key={expense._id} className="expense-item">
              <div className="expense-details">
                <span className="expense-category">{getCategoryLabel(expense.category)}</span>
                <span className="expense-amount">{formatNumber(expense.amount)}</span>
              </div>
              <div className="expense-date">
                תשלום הבא: {new Date(expense.recurringDetails.nextDate).toLocaleDateString('he-IL')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
