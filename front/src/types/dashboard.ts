export interface DashboardData {
    currentBalance: number;
    totalExpenses: number;
    expensesByCategory: ExpenseCategory[];
    recentExpenses: Expense[];
    upcomingExpenses: Expense[];
    alerts: Alert[];
    pendingRequests: {
        count: number;
        items: RequestItem[];
    };
}

export interface ExpenseCategory {
    category: string;
    amount: number;
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

export interface RequestItem {
    id: string;
    type: string;
    status: string;
    amount: number;
    date: string;
    description?: string;
} 