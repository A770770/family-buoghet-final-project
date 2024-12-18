import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import Dashboard from '../components/Dashboard';

const mockStore = configureStore([]);

/**
 * @class ComponentTest
 * @description בדיקות קומפוננטות React בסגנון TestNG
 */
class ComponentTest {
    // BeforeClass
    static beforeAll() {
        this.store = mockStore({
            expenses: [],
            auth: {
                token: 'test-token'
            }
        });
    }

    /**
     * @test
     * @group RENDER
     * @description בדיקת רינדור של קומפוננטות
     */
    async testComponentRendering() {
        // ExpenseForm
        const { getByTestId } = render(
            <Provider store={this.store}>
                <ExpenseForm />
            </Provider>
        );
        expect(getByTestId('expense-form')).toBeInTheDocument();

        // ExpenseList
        const { getByTestId: getListTestId } = render(
            <Provider store={this.store}>
                <ExpenseList />
            </Provider>
        );
        expect(getListTestId('expense-list')).toBeInTheDocument();

        TestNG.markTestComplete('testComponentRendering');
    }

    /**
     * @test
     * @group INTERACTION
     * @dependsOn testComponentRendering
     * @description בדיקת אינטראקציות משתמש
     */
    async testUserInteractions() {
        await TestNG.checkDependencies('testUserInteractions');

        const { getByTestId, getByText } = render(
            <Provider store={this.store}>
                <ExpenseForm />
            </Provider>
        );

        // מילוי טופס
        fireEvent.change(getByTestId('amount-input'), {
            target: { value: '100' }
        });
        fireEvent.change(getByTestId('category-input'), {
            target: { value: 'food' }
        });

        // שליחת טופס
        fireEvent.click(getByText('Submit'));

        await waitFor(() => {
            expect(this.store.getActions()).toContainEqual(
                expect.objectContaining({
                    type: 'ADD_EXPENSE'
                })
            );
        });
    }

    /**
     * @test
     * @group STATE
     * @description בדיקת ניהול state
     */
    async testStateManagement() {
        const { getByTestId } = render(
            <Provider store={this.store}>
                <Dashboard />
            </Provider>
        );

        // בדיקת מצב התחלתי
        expect(getByTestId('total-amount')).toHaveTextContent('0');

        // עדכון state
        this.store.dispatch({
            type: 'ADD_EXPENSE',
            payload: { amount: 100 }
        });

        await waitFor(() => {
            expect(getByTestId('total-amount')).toHaveTextContent('100');
        });
    }

    /**
     * @test
     * @group ASYNC
     * @description בדיקת פעולות אסינכרוניות
     */
    async testAsyncOperations() {
        const { getByTestId } = render(
            <Provider store={this.store}>
                <ExpenseList />
            </Provider>
        );

        // טעינת נתונים
        expect(getByTestId('loading-indicator')).toBeInTheDocument();

        await waitFor(() => {
            expect(getByTestId('expense-list')).toBeInTheDocument();
        });
    }

    /**
     * @test
     * @group RESPONSIVE
     * @description בדיקת רספונסיביות
     */
    async testResponsiveness() {
        const { container } = render(
            <Provider store={this.store}>
                <Dashboard />
            </Provider>
        );

        // בדיקת מדיה קוורי
        const styles = window.getComputedStyle(container.firstChild);
        expect(styles.display).toBe('flex');

        // שינוי גודל מסך
        window.innerWidth = 375; // mobile
        fireEvent(window, new Event('resize'));

        await waitFor(() => {
            const mobileStyles = window.getComputedStyle(container.firstChild);
            expect(mobileStyles.flexDirection).toBe('column');
        });
    }
}

// הגדרת הבדיקות ב-Jest
describe('Component Tests', () => {
    beforeAll(() => {
        ComponentTest.beforeAll();
    });

    const testInstance = new ComponentTest();

    // הגדרת תלויות
    TestNG.addDependency('testUserInteractions', 'testComponentRendering');

    // RENDER group
    describe('Render Tests', () => {
        test('Should render components correctly', async () => {
            await testInstance.testComponentRendering();
        });
    });

    // INTERACTION group
    describe('Interaction Tests', () => {
        test('Should handle user interactions', async () => {
            await testInstance.testUserInteractions();
        });
    });

    // STATE group
    describe('State Management Tests', () => {
        test('Should manage state correctly', async () => {
            await testInstance.testStateManagement();
        });
    });

    // ASYNC group
    describe('Async Tests', () => {
        test('Should handle async operations', async () => {
            await testInstance.testAsyncOperations();
        });
    });

    // RESPONSIVE group
    describe('Responsive Tests', () => {
        test('Should be responsive', async () => {
            await testInstance.testResponsiveness();
        });
    });
});

export default ComponentTest;
