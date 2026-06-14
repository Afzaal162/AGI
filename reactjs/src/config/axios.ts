import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', // ✅ changed from 127.0.0.1
    withCredentials: true 
});

export default api;