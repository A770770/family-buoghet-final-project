const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestAmount || !requestDescription || !requestCategory) {
        toast.error('נא למלא את כל השדות');
        return;
    }

    const childId = localStorage.getItem('childId');
    const token = localStorage.getItem('childToken');

    if (!childId || !token) {
        navigate('/login');
        return;const handleSubmitRequest = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!requestAmount || !requestDescription || !requestCategory) {
                toast.error('נא למלא את כל השדות');
                return;
            }
        
            const childId = localStorage.getItem('childId');
            const token = localStorage.getItem('childToken');
        
            if (!childId || !token) {
                navigate('/login');
                return;
            }
        
            setLoading(true);
            try {
                const response = await axios.post(`${API_URL}/api/children/${childId}/requests`, {
                    amount: parseFloat(requestAmount),
                    description: requestDescription,
                    category: requestCategory
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
        
                toast.success('הבקשה נשלחה בהצלחה');
                setRequestAmount('');
                setRequestDescription('');
                setShowRequestModal(false);
                
                // רענון הנתונים אחרי שליחת הבקשה
                await fetchChildData(childId, token);
                await fetchRequests(childId, token);
            } catch (error) {
                console.error('Error submitting request:', error);
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data?.message || 'שגיאה בשליחת הבקשה');
                }
            } finally {
                setLoading(false);
            }
        };
    }

    setLoading(true);
    try {
        const response = await axios.post(`${API_URL}/api/children/${childId}/requests`, {
            amount: parseFloat(requestAmount),
            description: requestDescription,
            category: requestCategory
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        toast.success('הבקשה נשלחה בהצלחה');
        setRequestAmount('');
        setRequestDescription('');
        setShowRequestModal(false);
        
        // רענון הנתונים אחרי שליחת הבקשה
        await fetchChildData(childId, token);
        await fetchRequests(childId, token);
    } catch (error) {
        console.error('Error submitting request:', error);
        if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || 'שגיאה בשליחת הבקשה');
        }
    } finally {
        setLoading(false);
    }
};