// src\hooks\useFetchOrganizedEventsData.tsx
import { useCallback, useEffect, useState } from 'react';
import authService from '../services/authService';

const useFetchOrganizedEventsData = (status?: string) => { // status now is optional
    const [data, setData] = useState<any>([]);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (statusParam?: string) => { // fetchData now accepts statusParam
        setLoading(true);
        setError(null);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error("No access token found. Please login again.");
            }

            const response = await authService.getOrganizedEvents(statusParam, accessToken); // Pass statusParam to API call
            if (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'events' in response.data) {
                setData(response.data.events);
            } else {
                throw new Error("Unexpected response format");
            }
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []); // fetchData dependency array is now empty, status is handled in useCallback argument

    useEffect(() => {
        fetchData(status); // Call fetchData with status from hook argument
    }, [fetchData, status]); // fetchData and status are dependencies

    return { data, error, loading, fetchData }; // Return fetchData for refresh
};

export default useFetchOrganizedEventsData;