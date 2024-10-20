import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import VideoPlayer from './pages/VideoPlayer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/room/:room" element={<VideoPlayer />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);
