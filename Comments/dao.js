import model from "./model.js";

export const createComment = (post) => {
    delete post._id;
    model.create(post)
};
export const findAllComments = () => model.find();
export const findCommentByPostId = (postId) => model.find({forPost: postId});
export const updateComment = (commentId, comment) =>  model.updateOne({ postId: commentId }, { $set: comment });
export const deleteComment = (commentId) => model.deleteOne({ _id: commentId });