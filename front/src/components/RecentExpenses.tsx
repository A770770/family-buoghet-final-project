import React from 'react';
import { Expense } from '../types/dashboard';

interface RecentExpensesProps {
  expenses: Expense[];
}

export const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses }) => {
  return (
    <div className="recent-expenses">
      <h3>הוצאות אחרונות</h3>
      <div className="expenses-list">
        {expenses.map((expense) => (
          <div key={expense._id} className="expense-item">
            <div className="expense-date">{new Date(expense.date).toLocaleDateString('he-IL')}</div>
            <div className="expense-details">
              <div className="expense-description">{expense.description}</div>
              <div className="expense-category">{expense.category}</div>
            </div>
            <div className="expense-amount">₪{expense.amount.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}; 