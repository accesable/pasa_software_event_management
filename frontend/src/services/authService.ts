import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/auth';
const API_EVENT_BASE_URL = 'http://localhost:8080/api/v1/events';
const API_CATEGORY_BASE_URL = 'http://localhost:8080/api/v1/categories'; // Define category base URL


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
      return window.location.href = data.url;

    } catch (error: any) {
      throw error.response.data
    }
  },
  createEvent: async (eventData: any, accessToken: string) => {
    try {
      const response = await axios.post(
        `${API_EVENT_BASE_URL}`,
        eventData,
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
  getCategories: async (accessToken: string) => { // Function to fetch categories
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
  createCategory: async (categoryData: any, accessToken: string) => { // Function to create a new category
    try {
      const response = await axios.post(
        `${API_CATEGORY_BASE_URL}`,
        categoryData,
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
  getEventDetails: async (eventId: string | undefined, accessToken?: string) => { // Function to fetch event details - accessToken is optional now
    try {
      const headers: any = { // Define headers as any to avoid type issues
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axios.get(`${API_EVENT_BASE_URL}/${eventId}`, { // Pass headers in axios.get config
        headers,
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  registerEvent: async (eventId: string, sessionIds: string[], accessToken: string) => { // Function to register for event
    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/participants`, // Correct endpoint for participant registration
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
  getOrganizedEvents: async (status?: string, accessToken?: string) => { // Function to fetch organized events, status is optional
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      let url = `${API_EVENT_BASE_URL}/organized-events`;
      if (status) {
        url += `?status=${status}`; // Append status query parameter if provided
      }
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
};

export default authService;