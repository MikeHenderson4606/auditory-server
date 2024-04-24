import model from "./model.js";

export const createUser = (user) => {
    delete user._id;
    model.create(user)
};
export const findAllUsers = () => model.find();
export const findUserById = (userId) => model.findOne({userId: userId});
export const findUserByUsername = (username) =>  model.findOne({ username: username });
export const findUserByCredentials = (username, password) =>  model.findOne({ username, password });
export const updateUser = (userId, user) =>  model.updateOne({ _id: userId }, { $set: user });
export const updateUserPosts = (userId, posts) =>  model.findByIdAndUpdate(userId, { posts: posts });
export const deleteUser = (userId) => model.deleteOne({ _id: userId });