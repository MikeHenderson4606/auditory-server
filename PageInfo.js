import { db } from "./Database/index.js";

export default function PageInfo(app) {
    const getPostDetails = (req, res) => {
        try {
            const postId = req.params.postId;
            const post = db.posts.find((post) => {
                return post.id == postId
            });
            res.json(post);
        } catch (err) {
            res.sendStatus(400);
        }
    }

    const getGenericPosts = (req, res) => {
        try {
            res.json(db.posts);
        } catch (err) {
            res.sendStatus(400);
        }
    }

    const getPersonalPosts = (req, res) => {
        try {
            const followsList = req.session['profile'].follows;

            const personalPosts = db.posts.filter((post) => {
                return followsList.includes(post.posterId);
            });
            res.json(personalPosts);
        } catch (err) {
            res.sendStatus(400);
        }
    }

    const likePost = (req, res) => {
        try {
            const userId = req.body.userId;
            const postId = req.body.postId;

            let i;
            db.posts.map((post, index) => {
                if (post.id == postId) {
                    i = index;
                }
            });
            console.log(db.posts[i]);
            db.posts[i].likedBy.push({
                "userId": parseInt(userId)
            });

            db.users.map((user, index) => {
                if (userId === user.userId) {
                    i = index;
                }
            });
            console.log(i);
            db.users[i].likes.push(parseInt(postId));
            res.sendStatus(200);
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    }

    const searchPosts = (req, res) => {
        try {
            const query = req.params.query;
            const postTitle = req.params.postTitle;
            const postArtist = req.params.postArtist;
            const postPoster = req.params.postPoster;
            console.log(query, postTitle, postArtist, postPoster);
            let finalResult = [];

            if (postTitle) {
                const postTitlesMatch = db.posts.filter((post) => {
                    return post.title.includes(query);
                });
                finalResult = finalResult.concat(postTitlesMatch);
            }
            if (postArtist) {
                const postArtistsMatch = db.posts.filter((post) => {
                    return post.artist.includes(query);
                });
                finalResult = finalResult.concat(postArtistsMatch);
            }
            if (postPoster) {
                const postPosterMatch = db.posts.filter((post) => {
                    return post.poster.includes(query);
                });
                finalResult = finalResult.concat(postPosterMatch);
            }
            res.send(finalResult);
        } catch (err) {
            res.json({
                code: 400,
                message: "Something went wrong trying to search for posts"
            })
        }
    }

    const searchUsers = (req, res) => {
        try {
            const query = req.params.query;
            const userUsername = req.params.username;
            const userUserId = req.params.userId;
            console.log(query, userUsername, userUserId);
            let finalResult = [];
            let users = db.users;
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

    app.get('/api/postdetails/:postId', (req, res) => getPostDetails(req, res));
    app.get('/api/genericposts', (req, res) => getGenericPosts(req, res));
    app.get('/api/personalposts', (req, res) => getPersonalPosts(req, res));
    app.post('/api/likepost', (req, res) => likePost(req, res));
    app.get('/api/searchposts/:query/:postTitle/:postArtist/:postPoster', (req, res) => searchPosts(req, res));
    app.get('/api/searchusers/:query/:username/:userId', (req, res) => searchUsers(req, res));
}