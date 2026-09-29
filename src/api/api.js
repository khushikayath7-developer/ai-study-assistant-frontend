import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://ai-study-assistant-backend-wzx9.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
  const detail = error.response?.data?.detail;

  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join('\n');
  if (error.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Please try again.';
  }
  if (!error.response) {
    return 'Unable to connect to the server. Check your internet connection and try again.';
  }
  const status = error.response?.status;
  return status ? `${fallback} (server error ${status})` : fallback;
};

// Attach JWT token to every request automatically (if logged in)
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const askQuestion = (question) =>
  api.post('/chat/ask', { question });

export const getChatHistory = () => api.get('/chat/history');

export const uploadFile = (fileAsset) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileAsset.uri,
    name: fileAsset.name || 'upload.pdf',
    type: fileAsset.type || 'application/pdf',
  });
  return api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const askAboutFile = (fileId, question) => {
  const formData = new FormData();
  formData.append('question', question);
  return api.post(`/files/${fileId}/ask`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const listFiles = () => api.get('/files/');

export default api;
