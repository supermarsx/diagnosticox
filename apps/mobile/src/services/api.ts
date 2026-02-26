import axios from 'axios';

// For local dev on simulator/emulator, replace localhost with your machine IP when needed.
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const diaryService = {
  getEntries: async (patientId: string) => {
    const response = await api.get(`/diary/patient/${patientId}`);
    return response.data;
  },
  createEntry: async (entry: any) => {
    const response = await api.post('/diary', entry);
    return response.data;
  },
  getStats: async (patientId: string) => {
    const response = await api.get(`/diary/patient/${patientId}/stats`);
    return response.data;
  },
};

export default api;
