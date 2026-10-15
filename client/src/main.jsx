import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from "axios";

// The built client is served by the API server, so it calls /api on the same domain.
// Set VITE_API_URL at build time only if the API lives on a different domain.
if(import.meta.env.MODE === 'development'){
  axios.defaults.baseURL = 'http://localhost:3000/api';
} else {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';
}

axios.defaults.withCredentials = true;

// Tell the server which language to answer in, from the language chosen in Settings
const kLanguageCodes = { 'English': 'en', 'Bahasa Melayu': 'ms', '中文': 'zh' };
axios.interceptors.request.use((config) => {
  let language = 'English';
  try {
    language = localStorage.getItem('language') || 'English';
  } catch (e) {
    // Storage can be unavailable (private mode); fall back to English
  }
  config.headers['X-Language'] = kLanguageCodes[language] || 'en';
  return config;
});

axios.defaults.headers.get["Client"] = "react";
axios.defaults.headers.post["Client"] = "react";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
