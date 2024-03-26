
import { db } from "./Database/index.js";

export default function Login(app) {
    const login = (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        var potentialUser = db.users.find(user => {
            return (user.username === username && user.password === password);
        });
        if (potentialUser) {
            req['currentUser'] = potentialUser;
            res.send(potentialUser);
        } else {
            console.log("No user found");
            res.sendStatus(400);
        }
    };

    const logout = (req, res) => {
        req.session.destroy();
        res.send(200);
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

    app.post("/login", (req, res) => login(req, res));
    app.post("/logout", (req, res) => logout(req, res));
    app.post("/register", (req, res) => register(req, res));
}
