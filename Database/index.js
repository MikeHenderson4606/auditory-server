
import users from "./users.json" assert { type: "json"};
import posts from "./posts.json" assert { type: "json"};

const db = { users, posts };

export { db };