// src/services/authService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/auth';
const API_EVENT_BASE_URL = 'http://localhost:8080/api/v1/events';
const API_CATEGORY_BASE_URL = 'http://localhost:8080/api/v1/categories';
// Định nghĩa API cho participants
const API_PARTICIPANTS_BASE_URL = 'http://localhost:8080/api/v1/participants';

const authService = {
  login: async (credentials: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  register: async (userData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, userData);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  googleLogin: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/google/login`);
      const data = response.data as { url: string };
      console.log(data.url);
      return (window.location.href = data.url);
    } catch (error: any) {
      throw error.response.data;
    }
  },

  createEvent: async (eventData: any, accessToken: string) => {
    try {
      const response = await axios.post(`${API_EVENT_BASE_URL}`, eventData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  logout: async (accessToken: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getCategories: async (accessToken: string) => {
    try {
      const response = await axios.get(`${API_CATEGORY_BASE_URL}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  createCategory: async (categoryData: any, accessToken: string) => {
    try {
      const response = await axios.post(`${API_CATEGORY_BASE_URL}`, categoryData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getEventDetails: async (eventId: string | undefined, accessToken?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axios.get(`${API_EVENT_BASE_URL}/${eventId}`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  registerEvent: async (eventId: string, sessionIds: string[], accessToken: string) => {
    try {
      const response = await axios.post(
        `${API_PARTICIPANTS_BASE_URL}`, // Sử dụng endpoint cho participant registration
        { eventId, sessionIds },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  deleteEvent: async (eventId: string, accessToken: string) => {
    try {
      const response = await axios.delete(`${API_EVENT_BASE_URL}/${eventId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  updateEvent: async (eventId: string, eventData: any, accessToken: string) => {
    try {
      const response = await axios.patch(`${API_EVENT_BASE_URL}/${eventId}`, eventData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getOrganizedEvents: async (status?: string, accessToken?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      let url = `${API_EVENT_BASE_URL}/organized-events`;
      if (status) {
        url += `?status=${status}`;
      }
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  uploadEventFiles: async (
    eventId: string,
    field: string,
    formData: FormData,
    accessToken: string
  ) => {
    try {
      const response = await axios.post(
        `${API_EVENT_BASE_URL}/events/${eventId}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
            field: field, // Truyền field vào header
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getEventParticipants: async (eventId: string | undefined, accessToken?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axios.get(`${API_EVENT_BASE_URL}/${eventId}/participants`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getParticipatedEvents: async (status?: string, accessToken?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      let url = `${API_EVENT_BASE_URL}/participated-events`;
      if (status && status !== 'all') {
        url += `?status=${status}`;
      }
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  // Hàm unregister (delete) participant event
  unregisterEvent: async (participantId: string, accessToken: string) => {
    try {
      const response = await axios.delete(`${API_PARTICIPANTS_BASE_URL}/${participantId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  // Hàm update lại sessions của participant
  updateParticipantSessions: async (
    participantId: string,
    sessionsData: any,
    accessToken: string
  ) => {
    try {
      const response = await axios.patch(
        `${API_PARTICIPANTS_BASE_URL}/${participantId}`,
        sessionsData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
};

export default authService;
