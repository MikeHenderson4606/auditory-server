import express from 'express';
import cors from 'cors'; // Cross origin resource sharing
                         // SSL: Secure sockets layer
import Login from './Login.js';
import spotLogin from './spotLogin.js';
import session from 'express-session';
const app = express();

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "Nothing to see here",
    cookie: { secure: false }
}));

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

app.use(express.json());

spotLogin(app);
Login(app);

app.listen(4000);