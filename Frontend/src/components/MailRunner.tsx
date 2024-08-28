// src/components/MailRunner.tsx
import React, { useState } from 'react';
import { runMailService } from '../services/api';
import { Button, TextField } from '@mui/material';

const MailRunner: React.FC = () => {
    const [serviceId, setServiceId] = useState('');

    const handleRunService = () => {
        runMailService(serviceId).then(() => {
            alert('Mail service run successfully!');
        });
    };

    return (
        <div>
            <TextField
                label="Service ID"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                fullWidth
            />
            <Button variant="contained" onClick={handleRunService}>
                Run Mail Service
            </Button>
        </div>
    );
};

export default MailRunner;
