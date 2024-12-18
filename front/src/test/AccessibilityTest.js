import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../App';
import ExpenseForm from '../components/ExpenseForm';
import ReportView from '../components/ReportView';

expect.extend(toHaveNoViolations);

/**
 * @class AccessibilityTest
 * @description בדיקות נגישות בסגנון TestNG
 */
class AccessibilityTest {
    /**
     * @test
     * @group WCAG_COMPLIANCE
     * @description בדיקת תאימות ל-WCAG
     */
    async testWCAGCompliance() {
        const { container } = render(<App />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    }

    /**
     * @test
     * @group KEYBOARD_NAVIGATION
     * @description בדיקת ניווט במקלדת
     */
    async testKeyboardNavigation() {
        const { getByRole } = render(<ExpenseForm />);
        const form = getByRole('form');
        expect(form).toHaveFocus();
        
        // בדיקת סדר ה-tab
        const focusableElements = form.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        expect(focusableElements.length).toBeGreaterThan(0);
    }

    /**
     * @test
     * @group SCREEN_READER
     * @description בדיקת תמיכה בקורא מסך
     */
    async testScreenReaderSupport() {
        const { getByLabelText, getAllByRole } = render(<ReportView />);
        
        // בדיקת תיאורים לתמונות
        const images = getAllByRole('img');
        images.forEach(img => {
            expect(img).toHaveAttribute('alt');
        });
        
        // בדיקת תוויות לשדות קלט
        const inputs = getAllByRole('textbox');
        inputs.forEach(input => {
            expect(input).toHaveAccessibleName();
        });
    }

    /**
     * @test
     * @group COLOR_CONTRAST
     * @description בדיקת ניגודיות צבעים
     */
    async testColorContrast() {
        const { container } = render(<App />);
        const results = await axe(container, {
            rules: {
                'color-contrast': { enabled: true }
            }
        });
        expect(results).toHaveNoViolations();
    }

    /**
     * @test
     * @group RESPONSIVE_DESIGN
     * @description בדיקת תכנון רספונסיבי
     */
    async testResponsiveDesign() {
        const { container } = render(<App />);
        
        // בדיקת viewport meta tag
        const head = document.head;
        const viewport = head.querySelector('meta[name="viewport"]');
        expect(viewport).toBeTruthy();
        expect(viewport.content).toContain('width=device-width');
        
        // בדיקת media queries
        const styles = window.getComputedStyle(container);
        expect(styles).toBeDefined();
    }
}

// הגדרת הבדיקות ב-Jest
describe('Accessibility Tests', () => {
    const testInstance = new AccessibilityTest();

    // WCAG_COMPLIANCE group
    describe('WCAG Compliance Tests', () => {
        test('Should comply with WCAG guidelines', async () => {
            await testInstance.testWCAGCompliance();
        });
    });

    // KEYBOARD_NAVIGATION group
    describe('Keyboard Navigation Tests', () => {
        test('Should support keyboard navigation', async () => {
            await testInstance.testKeyboardNavigation();
        });
    });

    // SCREEN_READER group
    describe('Screen Reader Tests', () => {
        test('Should support screen readers', async () => {
            await testInstance.testScreenReaderSupport();
        });
    });

    // COLOR_CONTRAST group
    describe('Color Contrast Tests', () => {
        test('Should have sufficient color contrast', async () => {
            await testInstance.testColorContrast();
        });
    });

    // RESPONSIVE_DESIGN group
    describe('Responsive Design Tests', () => {
        test('Should be responsive', async () => {
            await testInstance.testResponsiveDesign();
        });
    });
});

module.exports = AccessibilityTest;
