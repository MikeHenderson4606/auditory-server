
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

    async function SpotifyAPITemplate(req, requestTemplate) {
        try {
            const accessToken = req.session["spAccessToken"];
            requestTemplate.headers = {
                'Authorization': `Bearer ${accessToken}`
            }

            if (accessToken) {
                let response = await axios(requestTemplate);
                if (response.data.next) {
                    const newUrl = response.data.next;
                    requestTemplate.url = newUrl;
                    const nextResponse = await SpotifyAPITemplate(req, requestTemplate);
                    //console.log(nextResponse);
                    response.data.items = response.data.items.concat(nextResponse.items);
                    //console.log(response.data);
                    return response.data;
                }
                return response.data;
            } else {
                console.log("Access token is undefined");
                return 400;
            }
        } catch (err) {
            console.log("There was an error using the request template: ");
            console.log(requestTemplate.method, requestTemplate.url);
            console.log("With error code: ", err.code);
            return 400;
        }
    }

    const spGetProfile = async (req, res) => {
        const apiPath = `/me`;

        const requestTemplate = {
            method: 'get',
            url: `${SPOTIFY_API}${apiPath}`
        }

        res.send({
            accessToken: req.session["spAccessToken"],
            userData: await SpotifyAPITemplate(req, requestTemplate)
        });
    }

    const getSpotifyPlaylists = async (req, res) => {
        const userID = req.params.userId;
        const apiPath = `/users/${userID}/playlists`

        const requestTemplate = {
            method: 'get',
            url: `${SPOTIFY_API}${apiPath}`
        }

        res.send(await SpotifyAPITemplate(req, requestTemplate));
    }

    const getSpotifyTracks = async (req, res) => {
        const playlistId = req.params.playlistId;
        const apiPath = `/playlists/${playlistId}/tracks`

        const requestTemplate = {
            method: 'get',
            url: `${SPOTIFY_API}${apiPath}`
        }

        res.send(await SpotifyAPITemplate(req, requestTemplate));
    }

    const getLikedSongs = async (req, res) => {
        const apiPath = `/me/tracks`

        const requestTemplate = {
            method: 'get',
            url: `${SPOTIFY_API}${apiPath}`
        }

        res.send(await SpotifyAPITemplate(req, requestTemplate));
    }

    const playSong = async (req, res) => {
        const trackId = req.params.trackId;
        const apiPath = `/me/player/play`;
        let deviceId;

        try {
            const apiPathDevice = '/me/player/devices';
            const requestTemplate = {
                method: 'get',
                url: `${SPOTIFY_API}${apiPathDevice}`
            }

            const deviceResponse = await SpotifyAPITemplate(req, requestTemplate)
            deviceId = deviceResponse.devices[0].id;
        } catch (err) {
            return 400;
        }

        const requestTemplate = {
            method: 'put',
            url: `${SPOTIFY_API}${apiPath}?device_id=${deviceId}`,
            data: {
                uris: [trackId]
            }
        }
        
        res.send(await SpotifyAPITemplate(req, requestTemplate));
    }

    const pauseSong = async (req, res) => {
        const apiPath = `/me/player/pause`;
        let deviceId;

        try {
            const apiPathDevice = '/me/player/devices';
            const requestTemplate = {
                method: 'get',
                url: `${SPOTIFY_API}${apiPathDevice}`
            }

            const deviceResponse = await SpotifyAPITemplate(req, requestTemplate)
            deviceId = deviceResponse.devices[0].id;
        } catch (err) {
            return 400;
        }

        const requestTemplate = {
            method: 'put',
            url: `${SPOTIFY_API}${apiPath}?device_id=${deviceId}`
        }

        res.send(await SpotifyAPITemplate(req, requestTemplate));
    }

    app.get('/api/spcallback', (req, res) => spCallback(req, res));
    app.get('/api/spprofile', (req, res) => spGetProfile(req, res));
    app.post('/api/setCodeVerifier', (req, res) => setCodeVerifier(req, res));
    app.get('/api/spplaylists/:userId', (req, res) => getSpotifyPlaylists(req, res));
    app.get('/api/sptracks/:playlistId', (req, res) => getSpotifyTracks(req, res));
    app.get('/api/spplaysong/:trackId', (req, res) => playSong(req, res));
    app.get('/api/sppause', (req, res) => pauseSong(req, res));
    app.get('/api/splikedsongs', (req, res) => getLikedSongs(req, res));
}


