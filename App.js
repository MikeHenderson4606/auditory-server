import express from 'express';
import cors from 'cors'; // Cross origin resource sharing
                         // SSL: Secure sockets layer
import Login from './Login.js';
import spotLogin from './spotLogin.js';
import PageInfo from './PageInfo.js';
import session from 'express-session';
import MemoryStore from 'memorystore';
import "dotenv/config";

const app = express();
console.log(process.env.FRONTEND_URL);
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
}));

// Deployment url: https://main--tangerine-palmier-ecdbf4.netlify.app/

const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
};

if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
        sameSite: "none",
        secure: true,
        domain: process.env.HTTP_SERVER_DOMAIN,
    };
}

app.use(session(sessionOptions));

app.use(express.json());

spotLogin(app);
Login(app);
PageInfo(app);

app.listen(4000);