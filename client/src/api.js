import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const login = (data) => API.post('/auth/login', data);
export const getFeed = ({ style, language }) => API.get('/audios/feed', { params: { style, language } });
export const createAudio = (data) => API.post('/audios', data);
export const addToHistory = (audioId) => API.post('/audios/history', { audioId });
export const getHistory = () => API.get('/audios/history');
export const favorite = (audioId) => API.post('/audios/favorite', { audioId });
export const share = (audioId) => API.post('/audios/share', { audioId });
export const addComment = ({ audioId, content }) => API.post('/comments', { audioId, content });
export const getComments = (audioId) => API.get(`/comments/${audioId}`);