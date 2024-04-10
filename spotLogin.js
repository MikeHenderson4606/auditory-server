
import axios from 'axios';

const clientID = "08a8c25e8e4b41bba3e1b1e14e5dd2ee";
const redirect_uri = "http://localhost:4000/api/spcallback";
const SPOTIFY_API = "https://api.spotify.com/v1";

export default async function spotLogin(app) {
    let codeVerifier;

    const setCodeVerifier = (req, res) => {
        if (req.body) {
            codeVerifier = req.body.codeVerifier;
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    }

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

    async function SpotifyAPITemplate(req, apiPath) {
        try {
            const accessToken = req.session["spAccessToken"];

            if (accessToken) {
                const response = await axios.get(`${SPOTIFY_API}${apiPath}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                return response.data;
            } else {
                console.log("Access token is undefined");
                return 400;
            }
        } catch (err) {
            console.log("There was an error using the path: " + apiPath);
            return 400;
        }
    }

    const spGetProfile = async (req, res) => {
        const apiPath = `/me`;

        res.send({
            accessToken: req.session["spAccessToken"],
            userData: await SpotifyAPITemplate(req, apiPath)
        });
    }

    const getSpotifyPlaylists = async (req, res) => {
        const userID = req.params.userId;
        const apiPath = `/users/${userID}/playlists`

        res.send(await SpotifyAPITemplate(req, apiPath));
    }

    const getSpotifyTracks = async (req, res) => {
        const playlistId = req.params.playlistId;
        const apiPath = `/playlists/${playlistId}/tracks`

        res.send(await SpotifyAPITemplate(req, apiPath));
    }

    const playSong = async (req, res) => {
        const trackId = req.params.trackId;
        const apiPath = `/me/player/play`;

        const deviceResponse = await SpotifyAPITemplate(req, "/me/player/devices")
        const deviceId = deviceResponse.devices[0].id;
        console.log(deviceId);
        console.log(trackId);

        try {
            const accessToken = req.session["spAccessToken"];

            if (accessToken) {
                console.log(`${SPOTIFY_API}${apiPath}?device_id=${deviceId}`);
                const response = await axios.put(`${SPOTIFY_API}${apiPath}?device_id=${deviceId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    data: {
                        uris: [trackId]
                    }
                });
                console.log(response);
                res.send(response.data);
            } else {
                console.log("Access token is undefined");
                res.sendStatus(400);
            }
        } catch (err) {
            console.log("There was an error using the path: " + apiPath);
            res.sendStatus(400);
        }
    }

    app.get('/api/spcallback', (req, res) => spCallback(req, res));
    app.get('/api/spprofile', (req, res) => spGetProfile(req, res));
    app.post('/api/setCodeVerifier', (req, res) => setCodeVerifier(req, res));
    app.get('/api/spplaylists/:userId', (req, res) => getSpotifyPlaylists(req, res));
    app.get('/api/sptracks/:playlistId', (req, res) => getSpotifyTracks(req, res));
    app.get('/api/spplaysong/:trackId', (req, res) => playSong(req, res));
}


