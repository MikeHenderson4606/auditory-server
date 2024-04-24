import mongoose from "mongoose";
import schema from "./schema.js";

const model = mongoose.model("PostModel", schema);

export default model;