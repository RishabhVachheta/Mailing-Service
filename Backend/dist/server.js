"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promise_1 = __importDefault(require("mysql2/promise"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const db = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mail_service_db',
});
// 1. Create
app.post('/api/mail-configs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file } = req.body;
    try {
        const [result] = yield db.execute(`INSERT INTO mail_configs (host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file]);
        res.status(201).json({ message: 'Mail config added' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding mail config', error });
    }
}));
// 2. Read
app.get('/api/mail-configs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db.query('SELECT * FROM mail_configs');
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving mail configs', error });
    }
}));
// 3. Update
app.put('/api/mail-configs/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file } = req.body;
    try {
        yield db.execute(`UPDATE mail_configs SET host = ?, username = ?, password = ?, from_name = ?, from_email = ?, subject = ?, body = ?, body_type = ?, reply_to = ?, port = ?, security = ?, sleep = ?, data_file = ? WHERE id = ?`, [host, username, password, from_name, from_email, subject, body, body_type, reply_to, port, security, sleep, data_file, id]);
        res.json({ message: 'Mail config updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating mail config', error });
    }
}));
// 4. Delete
app.delete('/api/mail-configs/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield db.execute('DELETE FROM mail_configs WHERE id = ?', [id]);
        res.json({ message: 'Mail config deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting mail config', error });
    }
}));
app.post('/api/mail-configs/:id/send-mails', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [rows] = yield db.query('SELECT * FROM mail_configs WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Mail config not found' });
        }
        const config = rows[0];
        const transporter = nodemailer_1.default.createTransport({
            host: config.host,
            port: config.port,
            secure: config.security === 'ssl',
            auth: {
                user: config.username,
                pass: config.password,
            },
        });
        const dataFile = config.data_file;
        const addresses = yield fs_extra_1.default.readFile(dataFile, 'utf-8');
        const emails = addresses.split('\n').filter(email => email.trim() !== '');
        let successCount = 0;
        let failureCount = 0;
        for (const email of emails) {
            try {
                yield transporter.sendMail({
                    from: `${config.from_name} <${config.from_email}>`,
                    to: email,
                    subject: config.subject,
                    text: config.body_type === 'plain_text' ? config.body : undefined,
                    html: config.body_type === 'html' ? config.body : undefined,
                    replyTo: config.reply_to,
                });
                successCount++;
                yield fs_extra_1.default.writeFile(dataFile, emails.filter(e => e !== email).join('\n'));
                if (config.sleep > 0) {
                    yield new Promise(resolve => setTimeout(resolve, config.sleep * 1000));
                }
            }
            catch (error) {
                failureCount++;
            }
        }
        res.json({ message: 'Mails sent', successCount, failureCount });
    }
    catch (error) {
        res.status(500).json({ message: 'Error sending mails', error });
    }
}));
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
