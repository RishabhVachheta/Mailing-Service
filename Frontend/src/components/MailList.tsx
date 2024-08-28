// src/components/MailList.tsx
import React, { useEffect, useState } from 'react';
import { fetchMailServices } from '../services/api';
import { Button, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router';

interface MailService {
    id: string;
    host: string;
    from_name: string;
    subject: string;
}

const MailList: React.FC = () => {
    const [mailServices, setMailServices] = useState<MailService[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMailServices().then(response => {
            setMailServices(response.data);
        });
    }, []);

    return (
        <List>
            {mailServices.map(service => (
                <ListItem key={service.id}>
                    <ListItemText primary={`${service.from_name} - ${service.subject}`} />
                    <Button variant="contained" onClick={() => navigate(`/run/${service.id}`)}>Run</Button>
                </ListItem>
            ))}
        </List>
    );
};

export default MailList;
