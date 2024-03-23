import express from 'express';
import cors from 'cors'; // Cross origin resource sharing
                         // SSL: Secure sockets layer
import Login from './Login.js';
const app = express();

app.use(cors());
app.use(express.json());

Login(app);

app.listen(4000);