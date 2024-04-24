import * as dao from './dao.js';
import * as userDao from '../Users/dao.js';

export default function PostRoutes(app) {
    const getPostDetails = async (req, res) => {
        try {
            const postId = req.params.postId;
            const post = await dao.findPostById(postId);
            res.json(post);
        } catch (err) {
            res.sendStatus(400);
        }
    }

    const getGenericPosts = async (req, res) => {
        try {
            const genericPosts = await dao.findAllPosts();
            res.json(genericPosts);
        } catch (err) {
            res.sendStatus(400);
        }
    }

    const getPersonalPosts = async (req, res) => {
        try {
            const followsList = req.session['profile'].follows;

            const personalPosts = await Promise.all(followsList.map((follow) => {
                return dao.findPostByUser(follow);
            }));
            res.json(personalPosts[0]);
        } catch (err) {
            console.log(err);
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

    const searchPosts = async (req, res) => {
        try {
            const query = req.params.query;
            const postTitle = req.params.postTitle;
            const postArtist = req.params.postArtist;
            const postPoster = req.params.postPoster;
            console.log(query, postTitle, postArtist, postPoster);
            let finalResult = [];

            if (postTitle) {
                const postTitlesMatch = await dao.findPostByTitle(postTitle);
                finalResult = finalResult.concat(postTitlesMatch._doc);
            }
            if (postArtist) {
                const postArtistsMatch = await dao.findPostByArtist(postArtist);
                finalResult = finalResult.concat(postArtistsMatch._doc);
            }
            if (postPoster) {
                const postPosterMatch = await dao.findPostByPoster(postPoster);
                finalResult = finalResult.concat(postPosterMatch._doc);
            }
            res.send(finalResult);
        } catch (err) {
            res.json({
                code: 400,
                message: "Something went wrong trying to search for posts"
            })
        }
    }

    const deletePost = async (req, res) => {
        try {
            const postId = req.body.postId;
            let userPosts = req.body.userPosts;
            userPosts = userPosts.filter((post) => {
                return post !== parseInt(postId);
            })
            await dao.deletePost(postId);
            await userDao.updateUserPosts(userPosts);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(400);
        }
    }

    const createPost = async (req, res) => {
        try {
            const body = req.body;
            let userPosts = body.userPosts.map((post) => {
                return parseInt(post);
            });
            console.log(userPosts);
            await dao.createPost(body.post);
            console.log(body);
            await userDao.updateUserPosts(body.userId, userPosts);
            res.sendStatus(200);
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    }

    app.get('/api/postdetails/:postId', (req, res) => getPostDetails(req, res));
    app.get('/api/genericposts', (req, res) => getGenericPosts(req, res));
    app.get('/api/personalposts', (req, res) => getPersonalPosts(req, res));
    app.post('/api/likepost', (req, res) => likePost(req, res));
    app.get('/api/searchposts/:query/:postTitle/:postArtist/:postPoster', (req, res) => searchPosts(req, res));
    app.delete('/api/deletepost', (req, res) => deletePost(req, res));
    app.post('/api/createpost', (req, res) => createPost(req, res));
}