// client/src/api.js （确保所有接口都用 API 实例）
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const getFeed = (language = 'en') => API.get(`/audios/feed?language=${language}`);
export const getAudio = (id) => API.get(`/audios/${id}`);

export const favorite = (audioId) => API.post('/audios/favorite', { audioId });
export const share = (audioId) => API.post('/audios/share', { audioId });
export const addComment = (data) => API.post('/comments', data);
export const getComments = (audioId) => API.get(`/comments/${audioId}`);

// 新增 R2 签名和创建音频
export const getSignedUrl = (filename, filetype) => API.post('/audios/signed-url', { filename, filetype });
export const createAudio = (data) => API.post('/audios', data);


// 注意：必须添加 responseType，否则你会得到一堆乱码字符串
export const generateTTS = (data) => API.post('/audios/tts', data, { responseType: 'blob' });

