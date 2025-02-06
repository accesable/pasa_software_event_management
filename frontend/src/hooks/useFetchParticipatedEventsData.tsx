// src\hooks\useFetchParticipatedEventsData.tsx
import { useCallback, useEffect, useState } from 'react';
import authService from '../services/authService';

const useFetchParticipatedEventsData = (status?: string) => {
    const [data, setData] = useState<any>([]);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (statusParam?: string) => {
        setLoading(true);
        setError(null);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error("No access token found. Please login again.");
            }

            const response = await authService.getParticipatedEvents(statusParam, accessToken); // Call API for participated events
             if (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object') {
                setData(response.data);
            } else {
                throw new Error("Unexpected response format");
            }
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(status);
    }, [fetchData, status]);

    return { data, error, loading, fetchData };
};

export default useFetchParticipatedEventsData;