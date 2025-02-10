// src\hooks\useFetchTopClients.tsx
// src\hooks\useFetchTopClients.tsx
import { useCallback, useEffect, useState } from 'react';
import authService from '../services/authService';
import { User } from '../types';

interface UserApiResponse {
    statusCode: number;
    message: string;
    data: {
        users: User[];
        meta: {
            totalItems: number;
            page: number;
            limit: number;
            totalPages: number;
            count: number;
        };
    };
}

const useFetchTopClients = (limit?: number) => {
    const [data, setData] = useState<User[]>([]);
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

            const response = await authService.getUsers(accessToken);
            const apiResponse = response as UserApiResponse;

            if (apiResponse.statusCode === 200 && apiResponse.data.users) {
                let users = apiResponse.data.users;
                if (limit) {
                    users = users.slice(0, limit);
                }
                setData(users);
            } else {
                throw new Error(apiResponse.message || "Failed to fetch users");
            }
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        const fetchTopClientsData = async () => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    throw new Error("No access token found. Please login again.");
                }

                const response = await authService.getUsers(accessToken);
                const apiResponse = response as UserApiResponse;

                if (apiResponse.statusCode === 200 && apiResponse.data.users) {
                    let users = apiResponse.data.users;
                    if (limit) {
                        users = users.slice(0, limit);
                    }
                    setData(users);
                } else {
                    throw new Error(apiResponse.message || "Failed to fetch users");
                }
            } catch (error: any) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopClientsData();
    }, [limit]);

    return { data, error, loading };
};

export default useFetchTopClients;
