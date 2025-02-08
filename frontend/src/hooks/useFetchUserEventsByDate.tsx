// src\hooks\useFetchUserEventsByDate.tsx
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

interface UserEventsData {
  organizedEvents: any[];
  participatedEvents: any[];
}

const useFetchUserEventsByDate = (userId: string, year: number, month?: number) => {
  const [data, setData] = useState<UserEventsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { userId, year }; // Truyền userId vào query params
      if (month) {
        params.month = month;
      }
      const response = await axiosInstance.get(`/reports/user-events-by-date`, { // Đường dẫn API đã thay đổi
        params,
      });
      const responseData = response.data as { data: UserEventsData };
      setData(responseData.data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch user events by date');
    } finally {
      setLoading(false);
    }
  }, [userId, year, month]);

  useEffect(() => {
    if (userId && year) {
      fetchData();
    }
  }, [fetchData, userId, year]);

  return { data, loading, error, fetchData };
};

export default useFetchUserEventsByDate;
