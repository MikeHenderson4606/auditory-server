import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    forPost: Number,
    commenter: Number,
    commenterName: String,
    description: String
}, { collection: "comments" });

export default commentSchema;