import express from 'express';
import cors from 'cors'; // Cross origin resource sharing
                         // SSL: Secure sockets layer
import Login from './Login';
const app = express();
app.use(cors());

app.get('/', (req, res) => {res.send('Welcome to Auditory!')})
Login(app);

app.listen(4000);