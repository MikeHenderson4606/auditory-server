import express from 'express';
import cors from 'cors'; // Cross origin resource sharing
                         // SSL: Secure sockets layer
import spotLogin from './spotLogin.js';
import session from 'express-session';
import mongoose from 'mongoose';
import "dotenv/config";
import UserRoutes from './Users/routes.js';
import PostRoutes from './Posts/routes.js';
import CommentRoutes from './Comments/routes.js';

const connectionString = process.env.DB_CONNECTION_STRING ||  'mongodb://127.0.0.1:27017/kanbas';
mongoose.connect(connectionString);

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
UserRoutes(app);
PostRoutes(app);
CommentRoutes(app);

app.listen(4000);