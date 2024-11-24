export interface ExpenseCategory {
    category: string;
    amount: number;
}

export interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
}

export interface Alert {
    message: string;
    type: 'warning' | 'error' | 'info';
}

export interface Request {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
}

export interface DashboardData {
    currentBalance: number;
    totalExpenses: number;
    expensesByCategory: ExpenseCategory[];
    recentExpenses: Expense[];
    upcomingExpenses: Expense[];
    alerts: Alert[];
    pendingRequests: {
        count: number;
        items: Request[];
    };
} 