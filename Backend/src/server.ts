import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import fs from 'fs-extra';
import { RowDataPacket } from 'mysql2';
var cors = require('cors')


const app = express();
app.use(express.json());
app.use(cors())

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mail_service_db',
  });

// 1. Create
app.post('/api/mail-configs', async (req: Request, res: Response) => {
    const { host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file } = req.body;
    try {
      const [result] = await db.execute(
        `INSERT INTO mail_configs (host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file]
      );
      res.status(201).json({ message: 'Mail config added'});
    } catch (error) {
      res.status(500).json({ message: 'Error adding mail config', error });
    }
  });

// 2. Read
app.get('/api/mail-configs', async (req: Request, res: Response) => {
    try {
      const [rows] = await db.query('SELECT * FROM mail_configs');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving mail configs', error });
    }
  });

// 3. Update
app.put('/api/mail-configs/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file } = req.body;
    try {
      await db.execute(
        `UPDATE mail_configs SET host = ?, username = ?, password = ?, from_name = ?, from_email = ?, subject = ?, body = ?, body_type = ?, reply_to = ?, port = ?, security = ?, sleep = ?, data_file = ? WHERE id = ?`,
        [host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file, id]
      );
      res.json({ message: 'Mail config updated' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating mail config', error });
    }
    console.log("it is a working");
  });

  // 4. Delete
app.delete('/api/mail-configs/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await db.execute('DELETE FROM mail_configs WHERE id = ?', [id]);
      res.json({ message: 'Mail config deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting mail config', error });
    }
  });

  // 5. Send Mails

  interface MailConfig {
    id: number;
    host: string;
    username: string;
    password: string;
    from_name: string;
    from_email: string;
    subject: string;
    body: string;
    body_type: 'html' | 'plain_text';
    reply_to: string;
    port: number;
    security: 'ssl' | 'tls' | 'auto' | 'none';
    sleep: number;
    data_file: string;
  }

  app.post('/api/mail-configs/:id/send-mails', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const [rows] = await db.query<(MailConfig & RowDataPacket)[]>('SELECT * FROM mail_configs WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Mail config not found' });
      }
  
      const config = rows[0];
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.security === 'ssl',
        auth: {
          user: config.username,
          pass: config.password,
        },
      });
  
      const dataFile = config.data_file;
      const addresses = await fs.readFile(dataFile, 'utf-8');
      const emails = addresses.split('\n').filter(email => email.trim() !== '');
  
      let successCount = 0;
      let failureCount = 0;
  
      for (const email of emails) {
        try {
          await transporter.sendMail({
            from: `${config.from_name} <${config.from_email}>`,
            to: email,
            subject: config.subject,
            text: config.body_type === 'plain_text' ? config.body : undefined,
            html: config.body_type === 'html' ? config.body : undefined,
            replyTo: config.reply_to,
          });
          successCount++;
          await fs.writeFile(dataFile, emails.filter(e => e !== email).join('\n'));
          if (config.sleep > 0) {
            await new Promise(resolve => setTimeout(resolve, config.sleep * 1000));
          }
        } catch (error) {
          failureCount++;
        }
      }
  
      res.json({ message: 'Mails sent', successCount, failureCount });
    } catch (error) {
      res.status(500).json({ message: 'Error sending mails', error });
    }
  });
  
  // Start Server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

