// src\hooks\useFetchUserProfile.tsx
import useFetchData from './useFetchData';

const useFetchUserProfile = () => {
  return useFetchData(
    'http://localhost:8080/api/v1/users/profile',
    localStorage.getItem('accessToken') || undefined
  );
};

export default useFetchUserProfile;
