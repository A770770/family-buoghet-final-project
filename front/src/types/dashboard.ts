export interface DashboardData {
  currentBalance: number;
  totalExpenses: number;
  expensesByCategory: ExpenseCategory[];
  recentExpenses: Expense[];
  upcomingExpenses: Expense[];
  alerts: Alert[];
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  percentage?: number;
}

export interface Expense {
  _id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

export interface Alert {
  type: 'warning' | 'info' | 'error';
  message: string;
} 