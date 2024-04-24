import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: String,
    number: String,
    userId: Number,
    likes: [Number],
    posts: [Number],
    follows: [Number],
    role: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER",
    },
}, { collection: "users" });

export default userSchema;