import model from "./model.js";

export const createUser = (user) => {
    delete user._id;
    model.create(user)
};
export const findAllUsers = () => model.find({role: "USER"});
export const findUserById = (userId) => model.findOne({userId: userId});
export const findUserByUsername = (username) =>  model.findOne({ username: username });
export const findUserByCredentials = (username, password) =>  model.findOne({ username, password });
export const updateUser = (userId, user) =>  model.updateOne({ _id: userId }, { $set: user });
export const updateUserUsername = (userId, username) => model.findByIdAndUpdate(userId, { username: username });
export const updateUserEmail = (userId, email) => model.findByIdAndUpdate(userId, { email: email });
export const updateUserNumber = (userId, number) => model.findByIdAndUpdate(userId, { number: number });
export const updateUserPosts = (userId, posts) =>  model.findByIdAndUpdate(userId, { posts: posts });
export const updateUserLikes = (userId, likes) =>  model.findByIdAndUpdate(userId, { likes: likes });
export const deleteUser = (userId) => model.deleteOne({ _id: userId });