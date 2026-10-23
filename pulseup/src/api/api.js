import axios from 'axios';
import mockAdapter from './mockApi';

// Frontend-only API client. All requests are handled in the browser until the
// backend team connects real endpoints. No server URL or network calls here.
const api = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  adapter: mockAdapter,
});

export default api;
