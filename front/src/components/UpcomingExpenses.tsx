import React from 'react';
import { Expense } from '../types/dashboard';

interface UpcomingExpensesProps {
  expenses: Expense[];
}

export const UpcomingExpenses: React.FC<UpcomingExpensesProps> = ({ expenses }) => {
  return (
    <div className="upcoming-expenses">
      <h3>הוצאות קרובות</h3>
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