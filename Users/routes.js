import * as dao from "./dao.js";

export default function UserRoutes(app) {
    const login = async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        const currentUser = await dao.findUserByCredentials(username, password);

        if (currentUser) {
            req.session["profile"] = {...currentUser._doc, password: ""};
            res.send(req.session);
        } else {
            console.log("No user found");
            res.sendStatus(400);
        }
    };

    const profile = async (req, res) => {
        const userSession = req.session['profile'];

        if (userSession) {
            const user = await dao.findUserById(userSession.userId);
            if (user) {
                res.send(user._doc);
            } else {
                res.send();
            }
        } else {
            res.send();
        }
    }

    const logout = (req, res) => {
        console.log("Signing the user out");
        req.session['profile'] = {};
        res.sendStatus(200);
    };

    const register = async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;
        const number = req.body.number;
        const userId = parseInt(Date.now());

        const users = await dao.findAllUsers();

        if (!users.find((user) => user.username === username)) {
            const newUser = {
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
            req.session["profile"] = {...newUser, password: ""};
            
            dao.createUser(newUser);

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

    const getUser = async (req, res) => {
        const userId = req.params.userId;
        const user = await dao.findUserById(userId);
        if (user) {
            res.json({
                code: 200,
                user: {...user._doc, password: ""},
                message: "User Found"
            });
        } else {
            res.json({
                code: 400,
                message: "User with id " + userId + " cannot be found"
            });
        }
    }

    const searchUsers = async (req, res) => {
        try {
            const query = req.params.query;
            const userUsername = req.params.username;
            const userUserId = req.params.userId;
            console.log(query, userUsername, userUserId);
            let finalResult = [];
            let users = await dao.findAllUsers();
            users.map((user) => {delete user["password"]});

            if (userUsername) {
                const userUsernameMatch = users.filter((user) => {
                    console.log(user.username);
                    return user.username.includes(query);
                });
                finalResult = finalResult.concat(userUsernameMatch);
            }
            if (userUserId && parseInt(query)) {
                const userUserIdMatch = users.filter((user) => {
                    return user.userId === parseInt(query);
                });
                finalResult = finalResult.concat(userUserIdMatch);
            }
            res.send(finalResult);
        } catch (err) {
            console.log(err);
            res.json({
                code: 400,
                message: "Something went wrong trying to search for users"
            })
        }
    }

    const deleteUser = async (req, res) => {
        try {
            const userId = req.body.userId;
            await dao.deleteUser(userId);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(400);
        }
    }

    const updateUser = async (req, res) => {
        try {
            const body = req.body.data;
            const userId = body.userId;
            const username = body.username;
            const email = body.email;
            const number = parseInt(body.number);
            console.log(userId, username, email, number);
            await dao.updateUserUsername(userId, username);
            await dao.updateUserEmail(userId, email);
            await dao.updateUserNumber(userId, number);

            res.sendStatus(200);
        } catch(err) {
            res.sendStatus(400);
        }
    }

    app.post("/api/login", (req, res) => login(req, res));
    app.post("/api/logout", (req, res) => logout(req, res));
    app.post("/api/register", (req, res) => register(req, res));
    app.get("/api/profile", (req, res) => profile(req, res));
    app.get("/api/user/:userId", (req, res) => getUser(req, res));
    app.get('/api/searchusers/:query/:username/:userId', (req, res) => searchUsers(req, res));
    app.delete("/api/deleteuser", (req, res) => deleteUser(req, res));
    app.put("/api/updateuser", (req, res) => updateUser(req, res));
}