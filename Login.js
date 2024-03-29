
import { db } from "./Database/index.js";

export default function Login(app) {
    const login = (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        var potentialUser = db.users.find(user => {
            return (user.username === username && user.password === password);
        });
        if (potentialUser) {
            req.session.profile = potentialUser;
            res.send(req.session);
        } else {
            console.log("No user found");
            res.sendStatus(400);
        }
    };

    const profile = (req, res) => {
        res.send(req.session.profile);
    }

    const logout = (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    };

    const register = (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        var newUser = {
            username: username,
            password: password,
            userId: Date.now.toString()
        }
        db.users.push(newUser);
        res.send("Registering new user");
    };

    app.post("/api/login", (req, res) => login(req, res));
    app.post("/api/logout", (req, res) => logout(req, res));
    app.post("/api/register", (req, res) => register(req, res));
    app.get("/api/profile", (req, res) => profile(req, res));
}
