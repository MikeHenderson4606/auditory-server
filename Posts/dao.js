import model from "./model.js";

export const createPost = (post) => {
    delete post._id;
    model.create(post)
};
export const findAllPosts = () => model.find();
export const findPostById = (postId) => model.findOne({id: postId});
export const findPostByTitle = (title) => model.findOne({title: title});
export const findPostByArtist = (artist) => model.findOne({artist: artist});
export const findPostByPoster = (poster) => model.findOne({poster: poster});
export const findPostByUser = (userId) => model.find({posterId: userId});
export const updatePost = (postId, post) =>  model.updateOne({ postId: postId }, { $set: post });
export const deletePost = (postId) => model.deleteOne({ id: postId });