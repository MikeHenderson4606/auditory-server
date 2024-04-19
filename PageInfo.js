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

    app.get('/api/postdetails/:postId', (req, res) => getPostDetails(req, res));
    app.get('/api/genericposts', (req, res) => getGenericPosts(req, res));
    app.post('/api/likepost', (req, res) => likePost(req, res));
}