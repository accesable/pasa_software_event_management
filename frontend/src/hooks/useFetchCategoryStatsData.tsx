// src\hooks\useFetchCategoryStatsData.tsx
import { useCallback, useEffect, useState } from 'react';
import authService from '../services/authService';

interface CategoryStats {
    categoryName: string;
    eventCount: number;
    participantCount: number;
}

interface CategoryStatsResponse {
    statusCode: number;
    message: string;
    data: {
        categoryStats: CategoryStats[];
    };
}

const useFetchCategoryStatsData = () => {
    const [data, setData] = useState<CategoryStats[]>([]);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error("No access token found. Please login again.");
            }

            const response = await authService.getEventCategoryStats(accessToken);
            const apiResponse = response as CategoryStatsResponse;

            if (apiResponse.statusCode === 200 && apiResponse.data.categoryStats) {
                setData(apiResponse.data.categoryStats);
            } else {
                throw new Error(apiResponse.message || "Failed to fetch category stats");
            }
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, error, loading };
};

export default useFetchCategoryStatsData;
