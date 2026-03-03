import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CalculatorPage from './components/CalculatorPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
