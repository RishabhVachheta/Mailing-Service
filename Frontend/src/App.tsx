// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MailServiceRunner from './pages/MailServiceRunner';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/run/:id" element={<MailServiceRunner />} />
            </Routes>
        </Router>
    );
};

export default App;
