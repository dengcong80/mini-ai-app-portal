const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000'
  : 'https://mini-ai-backend-d86j.onrender.com';
  console.log('API_BASE_URL:', API_BASE_URL); 
export default API_BASE_URL;