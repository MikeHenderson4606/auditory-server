import mongoose from "mongoose";
import schema from "./schema.js";

const model = mongoose.model("CommentModel", schema);

export default model;