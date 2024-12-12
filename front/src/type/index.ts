/**
 * ממשק המגדיר את מבנה המשתמש במערכת
 */
export interface UserProps {
    /** שם המשתמש */
    username: string;

    /** כתובת אימייל */
    email: string;

    /** סיסמה */
    password: string;

    /** אימות סיסמה */
    confirmPassword: string;

    /** סוג המשתמש (הורה/ילד) */
    role: 'parent' | 'child';

    /** מזהה ייחודי */
    userId: string;
}