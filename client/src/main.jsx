import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from "axios";

if(import.meta.env.MODE === 'development'){
  axios.defaults.baseURL = 'http://localhost:3000/api';
} else {
    axios.defaults.baseURL = 'https://cckfm.marcusmarrio.com/api';
}

axios.defaults.withCredentials = true;

axios.defaults.headers.get["Client"] = "react";
axios.defaults.headers.post["Client"] = "react";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
