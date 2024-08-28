// src/pages/Home.tsx
import React from 'react';
import MailList from '../components/MailList';
import MailForm from '../components/MailForm';

const Home: React.FC = () => {
    return (
        <div>
            <h1>Mailing Service</h1>
            <MailForm />
            <MailList />
        </div>
    );
};

export default Home;
