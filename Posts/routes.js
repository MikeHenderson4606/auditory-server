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
            if (req.session['profile'].follows) {
                const followsList = req.session['profile'].follows;

                const personalPosts = await Promise.all(followsList.map(async (follow) => {
                    return await dao.findPostByUser(parseInt(follow));
                }));
                res.json(personalPosts[0]);
            }
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    }

    const likePost = async (req, res) => {
        try {
            const userId = req.body.userId;
            const likes = req.body.likes;

            await userDao.updateUserLikes(userId, likes);
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
            const body = req.body;
            const postId = req.body.postId;
            let userPosts = req.body.userPosts;
            userPosts = userPosts.filter((post) => {
                return post !== parseInt(postId);
            })
            await dao.deletePost(postId);
            await userDao.updateUserPosts(body.userId, userPosts);
            res.sendStatus(200);
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    }

    const createPost = async (req, res) => {
        try {
            const body = req.body;
            let userPosts = body.userPosts.map((post) => {
                return parseInt(post);
            });
            await dao.createPost(body.post);
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