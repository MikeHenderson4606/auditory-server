import express from 'express';
import cors from 'cors'; // Cross origin resource sharing
                         // SSL: Secure sockets layer
import Login from './Login.js';
import session from 'express-session';
const app = express();

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "Nothing to see here"
}));

app.use(cors());
app.use(express.json());

Login(app);

app.listen(4000);