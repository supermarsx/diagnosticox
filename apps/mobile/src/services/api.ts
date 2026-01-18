import axios from 'axios';

// For local dev, replace with your machine IP
const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const diaryService = {
  getEntries: async (patientId: string) => {
    const response = await api.get(`/diary?patientId=${patientId}`);
    return response.data;
  },
  createEntry: async (entry: any) => {
    const response = await api.post('/diary', entry);
    return response.data;
  },
  getStats: async (patientId: string) => {
    const response = await api.get(`/diary/stats/${patientId}`);
    return response.data;
  },
};

export default api;
