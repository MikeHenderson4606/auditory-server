import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: String,
    artist: String,
    poster: String,
    posterId: Number,
    description: String,
    id: Number,
    spotifyId: String,
    cover: String,
    likedBy: [{
        userId: Number
    }]
}, { collection: "posts" });

export default postSchema;