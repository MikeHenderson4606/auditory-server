
import axios from 'axios';

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
                'content-type': 'application/x-www-form-urlencoded'
            },
        };
        
        try {
            const body = await axios.post("https://accounts.spotify.com/api/token", payload, config);
            const response = body.data;

            req.session["spAccessToken"] = response.access_token;
            res.redirect("http://localhost:3000/");
        } catch (err) {
            console.log("Error getting the api token: " + err.code);
            res.sendStatus(400);
        }
    }

    const spGetProfile = async (req, res) => {
        try {
            const accessToken = req.session["spAccessToken"];

            if (accessToken) {
                const response = await axios.get(`${SPOTIFY_API}/me`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                res.send({
                    accessToken: accessToken,
                    userData: response.data
                });
            } else {
                console.log("Access token is undefined");
                res.sendStatus(400);
            }
        } catch(err) {
            console.log("Error getting the spotify user data: " + err.code);
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

    const getSpotifyPlaylists = async (req, res) => {
        try {
            const accessToken = req.session["spAccessToken"];
            const userID = req.params.userId;

            if (accessToken) {
                const response = await axios.get(`${SPOTIFY_API}/users/${userID}/playlists`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                res.send(response.data);
            } else {
                console.log("Access token is undefined");
                res.sendStatus(400);
            }
        } catch (err) {
            console.log("There was an error getting your spotify playlists");
            res.sendStatus(400);
        }
    }

    const getSpotifyTracks = async (req, res) => {
        try {
            const accessToken = req.session["spAccessToken"];
            const playlistId = req.params.playlistId;

            if (accessToken) {
                const response = await axios.get(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                res.send(response.data);
            } else {
                console.log("Access token is undefined");
                res.sendStatus(400);
            }
        } catch (err) {
            console.log("There was an error getting your spotify playlists");
            res.sendStatus(400);
        }
    }

    app.get('/api/spcallback', (req, res) => spCallback(req, res));
    app.get('/api/spprofile', (req, res) => spGetProfile(req, res));
    app.post('/api/setCodeVerifier', (req, res) => setCodeVerifier(req, res));
    app.get('/api/spplaylists/:userId', (req, res) => getSpotifyPlaylists(req, res));
    app.get('/api/sptracks/:playlistId', (req, res) => getSpotifyTracks(req, res));
}