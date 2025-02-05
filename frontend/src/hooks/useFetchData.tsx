// src\hooks\useFetchData.tsx
import { useCallback, useEffect, useState } from 'react';

const useFetchData = (url: string, token?: string) => { // Thêm tham số token tùy chọn
    const [data, setData] = useState<any>([]);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const headers: HeadersInit = { // Khởi tạo headers
                'Content-Type': 'application/json',
            };
            if (token) { // Nếu có token, thêm vào headers
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, { // Truyền headers vào fetch
                headers: new Headers(headers)
            });

            if (!response.ok) {
                const message = `This is an HTTP error: ${response.status}`;
                throw new Error(message);
            }

            const json = await response.json();
            setData(json);
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [url, token]); // Thêm token vào dependency array

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, error, loading };
};

export default useFetchData;