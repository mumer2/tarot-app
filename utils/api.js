import axios from 'axios';

export default axios.create({
  baseURL: 'https://backend-tarot.netlify.app/.netlify/functions',
});
