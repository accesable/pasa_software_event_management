// src\services\authService.ts
import axiosInstance from '../api/axiosInstance';

const BASE_URL = 'http://localhost:8080/api/v1';
const API_BASE_URL = `${BASE_URL}/auth`;
const API_EVENT_BASE_URL = `${BASE_URL}/events`;
const API_CATEGORY_BASE_URL = `${BASE_URL}/categories`;
const API_USERS_BASE_URL = `${BASE_URL}/users`;
const API_PARTICIPANTS_BASE_URL = `${BASE_URL}/participants`;
const API_TICKETS_BASE_URL = `${BASE_URL}/tickets`;
const API_REPORT_BASE_URL = `${BASE_URL}/reports`;

const authService = {
  login: async (credentials: any) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/login`, credentials);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  register: async (userData: any) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/register`, userData);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  createEvent: async (eventData: any, accessToken: string) => {
    try {
      const response = await axiosInstance.post(`${API_EVENT_BASE_URL}`, eventData, {
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
      const response = await axiosInstance.post(
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
      const response = await axiosInstance.get(`${API_CATEGORY_BASE_URL}`, {
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
      const response = await axiosInstance.post(`${API_CATEGORY_BASE_URL}`, categoryData, {
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
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/${eventId}`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  registerEvent: async (eventId: string, sessionIds: string[], accessToken: string) => {
    try {
      const response = await axiosInstance.post(
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
      const response = await axiosInstance.delete(`${API_EVENT_BASE_URL}/${eventId}`, {
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
      const response = await axiosInstance.patch(`${API_EVENT_BASE_URL}/${eventId}`, eventData, {
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
      const response = await axiosInstance.get(url, { headers });
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
      const response = await axiosInstance.post(
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
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/${eventId}/participants`, { headers });
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
      const response = await axiosInstance.get(url, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  // Hàm update lại sessions của participant
  updateParticipantSessions: async (
    eventId: string,
    sessionsData: any,
    accessToken: string
  ) => {
    try {
      const response = await axiosInstance.patch(
        `${API_PARTICIPANTS_BASE_URL}/${eventId}`,
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
  googleLogin: async () => { // Hàm googleLogin cho Server-Side Flow
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/google/login`);
      const data = response.data as { url: string }; // Backend có thể trả về URL đăng nhập Google (tùy chọn)
      window.location.href = data.url; // Chuyển hướng trình duyệt đến trang đăng nhập Google (nếu backend trả về url)
      // Hoặc, nếu backend không trả về URL, bạn có thể chỉ cần:
      // window.location.href = `${API_BASE_URL}/google/login`; // Chuyển hướng trực tiếp đến endpoint login của backend
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getTicketByParticipantId: async (participantId: string, accessToken?: string) => { // Add getTicketByParticipantId function
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_PARTICIPANTS_BASE_URL}/${participantId}/tickets`, { headers }); // Use correct endpoint
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getParticipantIdByUserIdEventId: async (eventId: string, accessToken?: string) => { // Updated function - Removed userId parameter
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_PARTICIPANTS_BASE_URL}/event/${eventId}/participant-id`, { headers }); // Updated API call - Removed userId from URL
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getUsers: async (accessToken?: string) => { // Hàm mới: Lấy danh sách users
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${BASE_URL}/users`, { headers }); // Gọi API /users
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  inviteUsersToEvent: async (eventId: string, users: { id: string, email: string }[], accessToken?: string) => { // Hàm mới: Mời users vào event
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.post(`${API_EVENT_BASE_URL}/${eventId}/invite`, { users }, { headers }); // Gọi API /events/{eventId}/invite
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  forgotPassword: async (email: string) => { // Hàm forgotPassword mới
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/forgot-password`, { email });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getParticipantIdByEventId: async (eventId: string | undefined, accessToken?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_PARTICIPANTS_BASE_URL}/event/${eventId}/participant-id`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  unregisterEvent: async (participantId: string, accessToken: string) => { // Updated function to take participantId
    try {
      const response = await axiosInstance.delete(`${API_PARTICIPANTS_BASE_URL}/${participantId}`, { // Use participantId directly
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  updateUserProfile: async (userData: any, accessToken: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axiosInstance.patch(`${API_USERS_BASE_URL}/profile`, userData, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  uploadAvatar: async (formData: FormData, accessToken: string) => {
    try {
      const response = await axiosInstance.post(`${API_USERS_BASE_URL}/upload/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  changePassword: async (passwordData: any, accessToken: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axiosInstance.post(`${API_BASE_URL}/change-password`, passwordData, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getUserProfile: async (accessToken?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_USERS_BASE_URL}/profile`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  scanTicket: async (code: string) => {
    try {
      const response = await axiosInstance.get(`${API_TICKETS_BASE_URL}/scan?code=${code}`);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getCategoryById: async (categoryId: string | undefined, accessToken?: string) => {
    try {
      if (!categoryId) {
        throw new Error("Category ID is required to fetch category details.");
      }
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_CATEGORY_BASE_URL}/${categoryId}`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getEventCategoryDistribution: async () => {
    try {
      const response = await axiosInstance.get('/reports/event-category-distribution');
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getEventQuestions: async (eventId: string) => { // Hàm lấy danh sách câu hỏi
    try {
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/${eventId}/questions`);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  postQuestion: async (eventId: string, text: string, accessToken: string) => { // Hàm đăng câu hỏi
    try {
      const response = await axiosInstance.post(
        `${API_EVENT_BASE_URL}/${eventId}/questions`,
        { text },
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

  postAnswer: async (questionId: string, text: string, accessToken: string) => { // Hàm đăng câu trả lời
    try {
      const response = await axiosInstance.post(
        `${API_EVENT_BASE_URL}/questions/${questionId}/answers`,
        { text },
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
  getUserById: async (userId: string) => { // Hàm mới: Lấy thông tin user theo ID
    try {
      const response = await axiosInstance.get(`${API_USERS_BASE_URL}/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getEventFeedbackByUser: async (eventId: string | undefined, accessToken?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/${eventId}/feedback/user`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  postEventFeedback: async (eventId: string, feedbackData: any, accessToken: string) => {
    try {
      const response = await axiosInstance.post(`${API_EVENT_BASE_URL}/${eventId}/feedback`, feedbackData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  patchEventFeedback: async (eventId: string, feedbackData: any, accessToken: string) => {
    try {
      const response = await axiosInstance.patch(`${API_EVENT_BASE_URL}/${eventId}/feedback`, feedbackData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getParticipantData: async (eventId: string | undefined, accessToken?: string) => { // Add this function
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/${eventId}/participant`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  declineEvent: async (eventId: string, token: string) => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}/decline?token=${token}`);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  acceptEvent: async (eventId: string, token: string) => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}/accept?token=${token}`);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  createSpeaker: async (speakerData: any, accessToken: string) => { // Hàm createSpeaker mới
    try {
      const response = await axiosInstance.post(`${BASE_URL}/speakers`, speakerData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  updateSpeaker: async (speakerId: string, speakerData: any, accessToken: string) => { // Hàm updateSpeaker mới
    try {
      const response = await axiosInstance.patch(`${BASE_URL}/speakers/${speakerId}`, speakerData, { // Sử dụng API_SPEAKERS_BASE_URL
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  createGuest: async (guestData: any, accessToken: string) => { // Hàm createGuest mới
    try {
      const response = await axiosInstance.post(`${BASE_URL}/guests`, guestData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  updateGuest: async (guestId: string, guestData: any, accessToken: string) => {
    try {
      const response = await axiosInstance.patch(`${BASE_URL}/guests/${guestId}`, guestData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getOrganizerEventFeedbackSummary: async (accessToken: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_REPORT_BASE_URL}/organizer-feedback-summary`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getUserEventsByDateReport: async (year: number, month: number | undefined, accessToken: string) => { // Đổi tên hàm rõ ràng hơn
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      let url = `${API_REPORT_BASE_URL}/events-by-date?year=${year}`;
      if (month) {
        url += `&month=${month}`;
      }
      const response = await axiosInstance.get(url, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getEventFeedbackSummary: async (eventId: string | undefined, accessToken?: string) => { // Hàm mới: Lấy feedback summary
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/${eventId}/feedback-analysis`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getEventFeedbacks: async (eventId: string | undefined, accessToken?: string) => { // Hàm mới: Lấy danh sách feedbacks
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      // ** Sử dụng endpoint chính xác, dựa trên response mẫu của bạn **
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/${eventId}/feedbacks`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getTotalEventsOverTime: async (accessToken?: string) => { // Added function
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/total-events-over-time`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getDashboardStats: async (accessToken?: string) => { // Added function
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/dashboard-stats`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  // getEventCategoryStats: async (accessToken?: string) => {
  //   try {
  //     const headers: any = {
  //       'Content-Type': 'application/json',
  //     };
  //     if (accessToken) {
  //       headers['Authorization'] = `Bearer ${accessToken}`;
  //     }
  //     const response = await axiosInstance.get(`${API_REPORT_BASE_URL}/event-category-stats`, { headers });
  //     return response.data;
  //   } catch (error: any) {
  //     throw error.response.data;
  //   }
  // },
  getEventInvitationReport: async (eventId: string | undefined, accessToken?: string) => { // Added function
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_REPORT_BASE_URL}/${eventId}/invitations`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getDetailedParticipantList: async (eventId: string | undefined, accessToken?: string) => { // Added function
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_PARTICIPANTS_BASE_URL}/event/${eventId}/detailed-list`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getCheckInOutStats: async (eventId: string | undefined, accessToken?: string) => { // Added function
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_PARTICIPANTS_BASE_URL}/${eventId}/check-in-out-stats`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  getEventCategoryStats: async (accessToken?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_REPORT_BASE_URL}/event-category-stats`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getEventComparisonData: async (accessToken?: string) => { // Added function
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/event-comparison`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getEventParticipantsWithFaces: async (eventId: string | undefined, accessToken?: string) => { // Added function
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await axiosInstance.get(`${API_EVENT_BASE_URL}/${eventId}/participants-with-faces`, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  checkIn: async (eventId: string, userId: string) => {
    try {
      const response = await axiosInstance.post(`${API_PARTICIPANTS_BASE_URL}/event/${eventId}/user/${userId}/check-in`);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  checkOut: async (eventId: string, userId: string) => {
    try {
      const response = await axiosInstance.post(`${API_PARTICIPANTS_BASE_URL}/event/${eventId}/user/${userId}/check-out`);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
};

export default authService;
