

export default function Login(app) {
    app.get("/login", (req, res) => {
        console.log("Logged in reached");
        res.send("logged in");
    })
}
