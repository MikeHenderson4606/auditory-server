import * as dao from './dao.js';

export default function CommentRoutes(app) {

    const getComments = async (req, res) => {
        try {
            const postId = req.params.postId;
            const comments = await dao.findCommentByPostId(parseInt(postId));
            res.send(comments);
        } catch (err) {
            res.sendStatus(400);
        }
    }

    app.get('/api/comments/:postId', (req, res) => getComments(req, res));
}