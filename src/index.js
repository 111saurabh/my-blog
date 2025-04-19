import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDl5_LNEGiAPvvVCYnnvSNQyZcxRvf-aAg",
  authDomain: "my-react-blog-bd105.firebaseapp.com",
  projectId: "my-react-blog-bd105",
  storageBucket: "my-react-blog-bd105.appspot.com",
  messagingSenderId: "761894267047",
  appId: "1:761894267047:web:4d4c127b245bc05c39d382"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
