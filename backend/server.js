const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');

const jwt = require("jsonwebtoken")
dotenv.config({ path: "./config/config.env" });

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../frontend")))

app.use(express.static(path.join(__dirname, '../frontend/public')));



const users = [];


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/contact.html"));

});

app.get("/blogs", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/blogs.html"));


});


app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/signup.html"));
});

app.post("/signup", (req, res) => {


    const { username, email, password, confirmPassword } = req.body;


    if (!username || !email || !password || !confirmPassword) {
        res.status(400).send("Required all fields");
    };

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        res.send("<h1>User already exist Please login</h1>");
    };

    const newUser = {
        username, email, password, confirmPassword
    };

    users.push(newUser);

    res.redirect('/login');

});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"))
});

app.post('/login', (req, res) => {


    const { email, password } = req.body;

    const user = users.find(user => user.email === email);

    if (!user) {
        res.send("<h1>Invalid User Please Register</h1>");
    }


    if (user.password !== password) {
        res.send("Invalid Password")
    }
    const token = jwt.sign({ email: user.email }, process.env.secret_key, { expiresIn: '10min' });


    res.redirect(`/profile?token=${token}`);

});

app.get("/profile", (req, res) => {
    const token = req.query.token;

    if (!token) {
        res.send("Access Denied");
        return;
    }

    try {

        const verifyToken = jwt.verify(token, process.env.secret_key);
        const user = users.find(u => u.email === verifyToken.email);

        if (!user) {
            res.status(404).send("User Not Found");
            return;
        }

        res.sendFile(path.join(__dirname, "../frontend/profile.html"));
    } catch (error) {
        res.send(error.message);
    }
});


app.listen(process.env.PORT, (req, res) => {
    console.log(`Server is running on port ${process.env.PORT}`);
});