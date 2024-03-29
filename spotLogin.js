
import queryString from 'querystring';
import axios from 'axios';

const clientID = "08a8c25e8e4b41bba3e1b1e14e5dd2ee";
const clientSecret = "b3164ef43fef4aac95d0e817b752c142";
const redirect_uri = "http://localhost:4000/api/spcallback";
var accessToken = "";

function createRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
  

export default function spotLogin(app) {

    const spLogin = (req, res) => {
        var state = createRandomString(16);
        var scope = 'user-read-private user-read-email';

        console.log("Redirecting to spotify auth");
        res.redirect('https://accounts.spotify.com/authorize?' +
            queryString.stringify({
                response_type: 'code',
                client_id: clientID,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state
        }));
    }

    const spCallback = (req, res) => {
        console.log(req.query);
        var code = req.query.code || null;
        var state = req.query.state || null;
        
        if (state === null) {
            res.redirect('/#' +
            queryString.stringify({
                error: 'state_mismatch'
            }));
        } else {
            const url = 'https://accounts.spotify.com/api/token';
            var authOptions = {
                client_id: clientID,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri
            };
            axios.post(url, queryString.stringify(authOptions), {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            }).then((response => {
                accessToken = response.data.access_token;
                axios.get('https://api.spotify.com/v1/me', {
                    headers: {
                        Authorization: 'Bearer ' + accessToken
                    }
                }).then(response => {
                    console.log(response.data);
                    req.session["spProfile"] = response.data;
                    console.log(req.session["spProfile"]);
                }).catch(err => {
                    res.sendStatus(400);
                })
            })).catch((error) => {
                console.log(error.code);
                res.sendStatus(400);
            });
            res.sendStatus(200);
        }
    }

    const spGetProfile = (req, res) => {
        try {
            console.log(req.session["spProfile"]);
            res.send(req.session.spProfile);
        } catch(err) {
            res.sendStatus(400);
        }
        
    }

    app.get('/api/splogin', (req, res) => spLogin(req, res));
    app.get('/api/spcallback', (req, res) => spCallback(req, res));
    app.get('/api/spprofile', (req, res) => spGetProfile(req, res));
}