import React from 'react';
import Login from './pages/Login';


import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from './pages/Register';
import Driver from './pages/Driver';
import Report from './pages/Report';
import System from './pages/System';
import Logs from './charts/security/Logs'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/driver" element={<Driver />} />
        <Route path="/report" element={<Report />} />
        <Route path="/system" element={<System />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </BrowserRouter>
  )
};

export default App;

