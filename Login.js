
import { db } from "./Database/index.js";
import fs from 'fs';

export default function Login(app) {
    const login = (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        var potentialUser = db.users.find(user => {
            return (user.username === username && user.password === password);
        });
        if (potentialUser) {
            req.session["profile"] = potentialUser;
            res.send(req.session);
        } else {
            console.log("No user found");
            res.sendStatus(400);
        }
    };

    const profile = (req, res) => {
        console.log(req.session);
        res.send(req.session["profile"]);
    }

    const logout = (req, res) => {
        console.log("Signing the user out");
        req.session.destroy();
        res.sendStatus(200);
    };

    const register = (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;
        var number = req.body.number;
        var userId = Date.now();

        if (!db.users.find((user) => user.username === username)) {
            var newUser = {
                username: username,
                password: password,
                email: email,
                number: number,
                userId: userId,
                likes: [],
                posts: [],
                follows: [],
                role: "USER"
            }
            req.session["profile"] = newUser;
            req.session.save();
            
            db.users.push(newUser);

            try {
                fs.writeFileSync('./Database/users.json', JSON.stringify(db.users, null, 2));
            } catch (err) {
                console.log(err);
                console.log("Cannot write to file");
            }

            res.json({
                code: 200,
                userId: userId,
                message: "User created"
            });
        } else {
            res.json({
                code: 400,
                message: "There already exists a user with that username"
            })
        }
        
    };

    app.post("/api/login", (req, res) => login(req, res));
    app.post("/api/logout", (req, res) => logout(req, res));
    app.post("/api/register", (req, res) => register(req, res));
    app.get("/api/profile", (req, res) => profile(req, res));
}
