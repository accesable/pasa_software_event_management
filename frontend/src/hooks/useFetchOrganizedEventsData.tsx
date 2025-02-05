// src\hooks\useFetchOrganizedEventsData.tsx
import { useCallback, useEffect, useState } from 'react';
import authService from '../services/authService';

const useFetchOrganizedEventsData = (status: string = 'SCHEDULED') => { // Default status là 'SCHEDULED'
    const [data, setData] = useState<any>([]);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error("No access token found. Please login again.");
            }

            const apiEndpoint = `http://localhost:8080/api/v1/events/organized-events?status=${status}`; // Luôn call API với status, default là SCHEDULED
            const response = await authService.getOrganizedEvents(status, accessToken); // Pass status và accessToken
            setData(response);
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [status]); // Depend on status để refetch khi statusFilter changes

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, error, loading };
};

export default useFetchOrganizedEventsData;