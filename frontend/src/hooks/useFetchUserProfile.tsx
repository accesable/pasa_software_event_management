// src\hooks\useFetchUserProfile.tsx
import useFetchData from './useFetchData';

const useFetchUserProfile = () => {
    return useFetchData(
        'http://l47.129.247.0:8080/api/v1/users/profile',
        localStorage.getItem('accessToken') || undefined
    );
};

export default useFetchUserProfile;
