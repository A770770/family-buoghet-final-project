import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/NotificationBell.css';

const API_URL = 'http://localhost:5004';

const NotificationBell: React.FC = () => {
    const [pendingCount, setPendingCount] = useState(0);

    const fetchPendingCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found');
                return;
            }

            console.log('Sending request with token:', token);
            const response = await axios.get(`${API_URL}/api/requests/pending-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Full response from server:', response);
            setPendingCount(response.data.count);
        } catch (error) {
            console.error('Error fetching pending requests count:', error);
            if (axios.isAxiosError(error)) {
                console.log('Response data:', error.response?.data);
                console.log('Response status:', error.response?.status);
            }
        }
    };

    useEffect(() => {
        fetchPendingCount();
        // עדכון כל 30 שניות
        const interval = setInterval(fetchPendingCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Link to="/children" className="notification-bell-container">
            <FaBell className={`notification-bell ${pendingCount > 0 ? 'has-notifications' : ''}`} />
            {pendingCount > 0 && (
                <span className="notification-count">{pendingCount}</span>
            )}
        </Link>
    );
};

export default NotificationBell;
