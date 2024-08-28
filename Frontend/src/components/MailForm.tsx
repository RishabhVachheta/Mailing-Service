// src/components/MailForm.tsx
import React, { useState } from 'react';
import { createMailService } from '../services/api';
import { TextField, Button, Grid } from '@mui/material';

const MailForm: React.FC = () => {
    const [formData, setFormData] = useState({
        host: '',
        username: '',
        password: '',
        from_name: '',
        from_email: '',
        subject: '',
        body: '',
        body_type: 'html',
        reply_to: '',
        port: '',
        security: 'ssl',
        sleep: 0,
        data_file: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMailService(formData).then(() => {
            alert('Mail service created successfully!');
            // Reset form or navigate
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                {/* Add TextFields for each field in formData */}
                <Grid item xs={12}>
                    <TextField label="Host" name="host" fullWidth onChange={handleChange} required />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Username" name="username" fullWidth onChange={handleChange} required />
                </Grid>
                {/* Add other form fields similarly */}
                <Grid item xs={12}>
                    <Button type="submit" variant="contained">Create Service</Button>
                </Grid>
            </Grid>
        </form>
    );
};
console.log("created service");

export default MailForm;
