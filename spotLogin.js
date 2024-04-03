
import axios from 'axios';
import { subtle } from 'crypto';

const clientID = "08a8c25e8e4b41bba3e1b1e14e5dd2ee";
const redirect_uri = "http://localhost:4000/api/spcallback";
const SPOTIFY_API = "https://api.spotify.com/v1";

export default async function spotLogin(app) {
    let codeVerifier;

    const spCallback = async (req, res) => {
        var code = req.query.code || null;

        const payload = new URLSearchParams({
            client_id: clientID,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirect_uri,
            code_verifier: codeVerifier,
        });

        const config = {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
        };
        
        try {
            const body = await axios.post("https://accounts.spotify.com/api/token", payload, config);
            const response = body.data;

            req.session["spAccessToken"] = response.access_token;
            res.redirect("http://localhost:3000/");
        } catch (err) {
            console.log(err.code);
            res.sendStatus(400);
        }
    }

    const spGetProfile = async (req, res) => {
        try {
            const accessToken = req.session["spAccessToken"];

            const response = await axios.get(`${SPOTIFY_API}/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            res.send({
                userData: response.data,
                accessToken: accessToken
            });
        } catch(err) {
            res.sendStatus(400);
        }
    }

    const setCodeVerifier = (req, res) => {
        if (req.body) {
            codeVerifier = req.body.codeVerifier;
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    }

    app.get('/api/spcallback', (req, res) => spCallback(req, res));
    app.get('/api/spprofile', (req, res) => spGetProfile(req, res));
    app.post('/api/setCodeVerifier', (req, res) => setCodeVerifier(req, res));
}